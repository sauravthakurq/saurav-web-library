/**
 * Headless verification of the built landing page.
 *
 * Serves the production build via `vite preview`, loads it in headless
 * Chromium, and asserts the structure/behavior the spec calls for. External
 * media (CloudFront videos, higgs.ai image) is aborted so the check is fast
 * and deterministic.
 *
 * Usage: npm run build && npm run verify
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4317;
const URL = `http://localhost:${PORT}/`;

const failures = [];
const check = (label, ok, detail = "") => {
	const status = ok ? "PASS" : "FAIL";
	console.log(`${status}  ${label}${detail ? ` — ${detail}` : ""}`);
	if (!ok) failures.push(label);
};

const preview = spawn(
	"npx",
	["vite", "preview", "--port", String(PORT), "--strictPort"],
	{
		stdio: "pipe",
	},
);

try {
	await new Promise((resolve, reject) => {
		const timer = setTimeout(
			() => reject(new Error("vite preview did not start in 30s")),
			30_000,
		);
		preview.stdout.on("data", (chunk) => {
			if (chunk.toString().includes(String(PORT))) {
				clearTimeout(timer);
				resolve();
			}
		});
		preview.on("exit", (code) =>
			reject(new Error(`vite preview exited early (code ${code})`)),
		);
	});

	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});

	// Keep the check offline-friendly: block heavyweight external media.
	await page.route(
		/cloudfront\.net|images\.higgs\.ai|fonts\.googleapis/,
		(route) => route.abort(),
	);

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(URL, { waitUntil: "domcontentloaded" });
	await page.waitForSelector("h1");

	check(
		"page title",
		(await page.title()).includes("Halo"),
		await page.title(),
	);

	// Hero
	const h1 = await page.locator("h1").innerText();
	check(
		'h1 = "Your Wealth / Works"',
		/Your Wealth\s*\n?\s*Works/.test(h1),
		JSON.stringify(h1),
	);
	check(
		"h1 letter-spacing -0.04em",
		(await page.locator("h1").getAttribute("style"))?.includes("-0.04em") ??
			false,
	);
	// Chromium normalizes the inline calc() expression, so assert behaviorally:
	// the hero card must measure exactly viewport height minus 96px.
	const heroCard = await page.evaluate(() => {
		const card = document.querySelector("h1")?.closest("div[style]");
		if (!card) return null;
		return {
			style: card.getAttribute("style"),
			height: card.getBoundingClientRect().height,
			expected: window.innerHeight - 96,
		};
	});
	check(
		"hero card height = 100vh - 96px",
		heroCard !== null &&
			/calc\(/.test(heroCard.style) &&
			heroCard.height === heroCard.expected,
		JSON.stringify(heroCard),
	);

	// Navbar
	check(
		"5 nav links, hidden-below-md container",
		(await page.locator("nav .hidden.md\\:flex a").count()) === 5,
	);
	for (const label of ["Open Wallet", "Join us", "Discover it"]) {
		check(
			`button "${label}"`,
			(await page.locator(`button:has-text("${label}")`).count()) === 1,
		);
	}

	// Videos
	const videoStats = await page.$$eval("video", (els) =>
		els.map((v) => ({
			autoplay: v.hasAttribute("autoplay"),
			muted: v.muted || v.hasAttribute("muted"),
			loop: v.hasAttribute("loop"),
			playsInline: v.hasAttribute("playsinline"),
		})),
	);
	check(
		"2 background videos",
		videoStats.length === 2,
		JSON.stringify(videoStats),
	);
	check(
		"videos autoplay/muted/loop/playsInline",
		videoStats.every((v) => v.autoplay && v.muted && v.loop && v.playsInline),
	);

	// Marquees
	check(
		"hero marquee renders 7 brands twice",
		(await page.locator(".marquee-track > span").count()) === 14,
	);
	check(
		"backers marquee renders 8 brands twice",
		(await page.locator(".backers-track > span").count()) === 16,
	);
	const heroAnim = await page
		.locator(".marquee-track")
		.evaluate((el) => getComputedStyle(el).animation);
	check(
		"hero marquee animation 22s linear infinite",
		/22s linear .*infinite/.test(heroAnim),
		heroAnim,
	);
	const backersAnim = await page
		.locator(".backers-track")
		.evaluate((el) => getComputedStyle(el).animation);
	check(
		"backers marquee animation 30s linear infinite",
		/30s linear .*infinite/.test(backersAnim),
		backersAnim,
	);
	const marqueeMoved = await page
		.locator(".marquee-track")
		.evaluate(async (el) => {
			const x1 = el.getBoundingClientRect().x;
			await new Promise((r) => setTimeout(r, 600));
			return el.getBoundingClientRect().x !== x1;
		});
	check("hero marquee is actually moving", marqueeMoved);

	// Section copy
	for (const text of [
		"Meet USD Halo.",
		"Use modes",
		"Commerce",
		"Savings that bloom",
		"Know more",
	]) {
		check(
			`copy present: "${text}"`,
			(await page.getByText(text, { exact: false }).count()) >= 1,
		);
	}

	// Page + card backgrounds
	const bodyBg = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	);
	check("page background #F5F5F5", bodyBg === "rgb(245, 245, 245)", bodyBg);
	const darkCards = await page.$$eval(
		"div",
		(els) =>
			els.filter(
				(el) => getComputedStyle(el).backgroundColor === "rgb(43, 38, 68)",
			).length,
	);
	check("two #2B2644 cards", darkCards === 2, `found ${darkCards}`);

	// font-medium maps to 600 (TT Norms Pro semibold)
	const h1Weight = await page
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontWeight);
	check("font-medium renders as 600", h1Weight === "600", h1Weight);

	const realErrors = consoleErrors.filter(
		(e) => !/net::ERR_FAILED|Failed to load resource|ERR_BLOCKED/i.test(e),
	);
	check(
		"no console/page errors",
		realErrors.length === 0,
		realErrors.join(" | "),
	);

	await browser.close();
} finally {
	preview.kill();
}

if (failures.length > 0) {
	console.error(`\n${failures.length} check(s) failed`);
	process.exit(1);
}
console.log("\nAll checks passed ✔");
