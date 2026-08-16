/**
 * Headless E2E verification for the Michael Smith portfolio.
 * Builds are served via `vite preview`; Chromium drives the page and asserts
 * every section of the spec renders and behaves.
 *
 * Run: npm run build && node scripts/verify.mjs
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { chromium } from "playwright";

// Grab a free port so parallel experiments never collide.
const PORT = await new Promise((resolve, reject) => {
	const probe = createServer();
	probe.once("error", reject);
	probe.listen(0, () => {
		const { port } = probe.address();
		probe.close(() => resolve(port));
	});
});
const URL = `http://localhost:${PORT}/`;

let failures = 0;
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
	failures += 1;
	console.error(`  ✗ ${msg}`);
};
const check = (cond, msg) => (cond ? pass(msg) : fail(msg));

const waitForServer = async (url, timeoutMs = 15000) => {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			// not up yet
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error(`Preview server did not start at ${url}`);
};

const server = spawn(
	"./node_modules/.bin/vite",
	["preview", "--port", String(PORT), "--strictPort"],
	{ stdio: "ignore" },
);
server.on("exit", (code) => {
	if (code !== null && code !== 0) {
		console.error(`Preview server exited with code ${code} (port in use?)`);
		process.exit(1);
	}
});

try {
	await waitForServer(URL);
	console.log(`Preview server up at ${URL}\n`);

	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	page.setDefaultTimeout(10000);

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(URL, { waitUntil: "load" });
	// Wait for React to mount the loading screen before asserting.
	await page.waitForSelector('div[aria-label="Loading"]');

	console.log("Section 1 — Loading screen");
	check(
		await page.getByText("Portfolio", { exact: true }).isVisible(),
		'top-left "Portfolio" label visible',
	);
	const counter = page.locator("span.tabular-nums").first();
	check(
		/^\d{3}$/.test((await counter.textContent())?.trim() ?? ""),
		"counter shows zero-padded 3 digits",
	);
	const rotatingWord = await page
		.locator(".font-display.italic")
		.first()
		.textContent();
	check(
		["Design", "Create", "Inspire"].includes(rotatingWord?.trim() ?? ""),
		`rotating word cycle active (saw "${rotatingWord?.trim()}")`,
	);

	// Wait out the 2700ms count + 400ms delay + exit fade.
	await page.waitForTimeout(4200);
	check(
		(await page.locator('div[aria-label="Loading"]').count()) === 0,
		"loading screen unmounts after counter completes",
	);

	console.log("\nSection 2 — Hero");
	const name = page.locator("h1.name-reveal");
	check(await name.isVisible(), '"Michael Smith" headline rendered');
	// Entrance timeline runs ~1.3s after the loading screen clears — wait for it to settle.
	const entranceDone = await page
		.waitForFunction(
			() => {
				const el = document.querySelector("h1.name-reveal");
				return el && getComputedStyle(el).opacity === "1";
			},
			undefined,
			{ timeout: 5000 },
		)
		.then(() => true)
		.catch(() => false);
	check(entranceDone, "GSAP entrance ran (headline opacity reaches 1)");
	check(
		(await page.locator("nav[aria-label='Primary'] a").count()) === 5,
		"navbar pill contains logo + 3 links + say-hi",
	);
	const heroVideoState = await page.locator("#home video").evaluate((v) => ({
		src: v.currentSrc || v.src,
		readyState: v.readyState,
	}));
	check(
		heroVideoState.src.startsWith("blob:"),
		`hls.js attached MediaSource to hero video (src: ${heroVideoState.src.slice(0, 24)}…)`,
	);
	const roleBefore = await page.locator(".animate-role-fade-in").textContent();
	await page.waitForTimeout(2200);
	const roleAfter = await page.locator(".animate-role-fade-in").textContent();
	check(
		roleBefore !== roleAfter,
		`role word cycles every 2s ("${roleBefore}" → "${roleAfter}")`,
	);
	check(await page.getByText("COLLECTION '26").isVisible(), "eyebrow visible");
	check(
		await page.getByText("Scroll", { exact: true }).isVisible(),
		"scroll indicator visible (CSS-uppercased label)",
	);

	console.log("\nSection 3 — Selected Works");
	check(
		(await page.locator("#work article").count()) === 4,
		"bento grid renders 4 project cards",
	);
	check(
		await page
			.locator("#work h2")
			.textContent()
			.then((t) => t?.includes("Featured")),
		'heading "Featured projects" present',
	);

	console.log("\nSection 4 — Journal");
	check(
		(await page.locator("#journal article").count()) === 4,
		"journal renders 4 entries",
	);

	console.log("\nSection 5 — Explorations");
	const cards = page.locator("button[aria-label^='Open ']");
	check((await cards.count()) === 6, "parallax gallery renders 6 cards");
	check(
		await page.getByText("Visual").isVisible(),
		"pinned centre heading present",
	);

	// Lightbox open/close.
	await cards.first().scrollIntoViewIfNeeded();
	await page.waitForTimeout(600);
	await cards.first().click();
	await page.waitForTimeout(500);
	check(
		(await page.locator("div[role='dialog']").count()) === 1,
		"lightbox opens on card click",
	);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(500);
	check(
		(await page.locator("div[role='dialog']").count()) === 0,
		"lightbox closes on Escape",
	);

	console.log("\nSection 6 — Stats");
	await page.locator("#resume").scrollIntoViewIfNeeded();
	await page.waitForTimeout(2200);
	const statTexts = await page
		.locator("#resume .tabular-nums")
		.allTextContents();
	check(
		statTexts.join(" ").includes("20+") &&
			statTexts.join(" ").includes("95+") &&
			statTexts.join(" ").includes("200%"),
		`stat counters reach 20+ / 95+ / 200% (saw: ${statTexts.join(", ")})`,
	);

	console.log("\nSection 7 — Contact / Footer");
	await page.locator("#contact").scrollIntoViewIfNeeded();
	await page.waitForTimeout(800);
	const marqueeCount = await page
		.locator("#contact span", { hasText: "BUILDING THE FUTURE" })
		.count();
	check(marqueeCount >= 10, `marquee repeats text 10× (found ${marqueeCount})`);
	const marqueeMoved = await page
		.locator("#contact .w-max")
		.evaluate((el) => getComputedStyle(el).transform !== "none");
	check(marqueeMoved, "GSAP marquee is animating (transform applied)");
	check(
		(await page.locator("#contact video").count()) === 1,
		"footer background video present",
	);
	check(
		(await page.locator("a[href='mailto:hello@michaelsmith.com']").count()) >=
			1,
		"mailto CTA present",
	);
	check(
		(await page.locator("nav[aria-label='Social links'] a").count()) === 4,
		"4 social links present",
	);
	check(
		await page.getByText("Available for projects").isVisible(),
		"availability badge visible",
	);

	console.log("\nScroll-spy + smooth nav");
	// Exact class tokens only — `hover:bg-stroke/50` on inactive links must not match.
	const hasActiveClass = (el) =>
		el.className.split(/\s+/).includes("bg-stroke/50");
	const workActive = await page
		.locator("nav[aria-label='Primary'] a", { hasText: "Work" })
		.evaluate(hasActiveClass);
	// After scrolling to the footer, Resume (stats) should be the active link.
	check(!workActive, "Work link not active at page bottom");
	const resumeActive = await page
		.locator("nav[aria-label='Primary'] a", { hasText: "Resume" })
		.evaluate(hasActiveClass);
	check(resumeActive, "Resume link active after scrolling past stats");

	console.log("\nConsole health");
	const realErrors = consoleErrors.filter(
		(e) => !e.includes("Failed to load resource"), // remote CDN hiccups aren't app bugs
	);
	check(
		realErrors.length === 0,
		`no console/page errors (${realErrors.length} found)`,
	);
	if (realErrors.length) realErrors.forEach((e) => console.error(`    ${e}`));

	await browser.close();
} finally {
	server.kill("SIGTERM");
}

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
