/**
 * Headless CLI verification for the Asme liquid-glass landing page.
 * Builds are assumed done; this serves ./dist via `vite preview` and checks
 * the rendered DOM, computed styles, video wiring, and console errors.
 */
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { preview } from "vite";

const VIDEO_URLS = {
	hero: "hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4",
	featured: "hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4",
	philosophy: "hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
	service1: "hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
	service2: "hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
};

const failures = [];
const check = (name, ok, detail = "") => {
	const status = ok ? "PASS" : "FAIL";
	console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
	if (!ok) failures.push(name);
};

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const server = await preview({
	root: projectRoot,
	preview: { port: 0 },
});
const baseUrl = server.resolvedUrls.local[0];
console.log(`[INFO] preview server at ${baseUrl}`);

const browser = await chromium.launch();
try {
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(baseUrl, { waitUntil: "networkidle" });

	check("page title", (await page.title()).includes("Asme"));

	// --- Hero ---
	const h1 = page.locator("h1");
	check(
		"hero heading text",
		(await h1.innerText()).replace(/\s+/g, " ").trim() === "Know it all.",
	);
	check(
		"hero heading uses Instrument Serif",
		(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).includes(
			"Instrument Serif",
		),
	);
	check(
		"hero heading italic <em>",
		(await h1.locator("em").innerText()) === "all",
	);

	const heroVideo = page.locator("section").first().locator("video");
	check(
		"hero video src",
		(await heroVideo.getAttribute("src")).includes(VIDEO_URLS.hero),
	);
	check(
		"hero video muted+playsinline",
		await heroVideo.evaluate((v) => v.muted && v.playsInline),
	);
	check(
		"hero video has no loop attr (manual crossfade loop)",
		!(await heroVideo.evaluate((v) => v.loop)),
	);

	// Email capture pill
	const emailInput = page.locator('input[type="email"]');
	check(
		"email input placeholder",
		(await emailInput.getAttribute("placeholder")) === "Enter your email",
	);
	check(
		"subscribe arrow button",
		(await page.locator('form button[type="submit"]').count()) === 1,
	);

	// Navbar
	for (const link of ["Features", "Pricing", "About"]) {
		check(
			`nav link "${link}"`,
			(await page.locator("nav", { hasText: link }).count()) > 0,
		);
	}
	check(
		'nav brand "Asme"',
		(await page.locator("nav >> text=Asme").count()) === 1,
	);
	check(
		"Login button",
		(await page.locator("nav button", { hasText: "Login" }).count()) === 1,
	);
	check(
		"Manifesto button",
		(await page.locator("button", { hasText: "Manifesto" }).count()) === 1,
	);
	check("3 social icon links", (await page.locator("footer a").count()) === 3);

	// --- Liquid glass ---
	const glassCount = await page.locator(".liquid-glass").count();
	check(
		"liquid-glass elements present",
		glassCount >= 9,
		`${glassCount} found`,
	);
	const glassStyle = await page
		.locator(".liquid-glass")
		.first()
		.evaluate((el) => {
			const s = getComputedStyle(el);
			const before = getComputedStyle(el, "::before");
			return {
				backdrop: s.backdropFilter || s.webkitBackdropFilter,
				boxShadow: s.boxShadow,
				overflow: s.overflow,
				beforeContent: before.content,
				beforePadding: before.paddingTop,
			};
		});
	check(
		"liquid-glass backdrop blur(4px)",
		glassStyle.backdrop === "blur(4px)",
		glassStyle.backdrop,
	);
	check(
		"liquid-glass inset highlight",
		glassStyle.boxShadow.includes("inset"),
		glassStyle.boxShadow,
	);
	check("liquid-glass overflow hidden", glassStyle.overflow === "hidden");
	check(
		"liquid-glass ::before border gradient",
		glassStyle.beforeContent === '""',
		glassStyle.beforeContent,
	);
	check(
		"liquid-glass ::before 1.4px padding",
		glassStyle.beforePadding === "1.4px",
		glassStyle.beforePadding,
	);

	// --- Page background ---
	const bodyBg = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	);
	check("body bg-black", bodyBg === "rgb(0, 0, 0)", bodyBg);

	// --- All five videos wired correctly ---
	const videoSrcs = await page
		.locator("video")
		.evaluateAll((vs) => vs.map((v) => v.src));
	check(
		"5 videos on page",
		videoSrcs.length === 5,
		`${videoSrcs.length} found`,
	);
	for (const [name, url] of Object.entries(VIDEO_URLS)) {
		check(
			`${name} video URL`,
			videoSrcs.some((s) => s.includes(url)),
		);
	}
	const loopFlags = await page
		.locator("video")
		.evaluateAll((vs) => vs.map((v) => v.loop));
	check(
		"4 looping videos (all but hero)",
		loopFlags.filter(Boolean).length === 4,
		loopFlags.join(","),
	);

	// --- Sections render with copy after scroll-triggered animations ---
	for (const text of [
		"About Us",
		"Pioneering",
		"create, build, and inspire.",
		"Our Approach",
		"Explore more",
		"Innovation",
		"Choose your space",
		"Shape the future",
		"What we do",
		"Research & Insight",
		"Design & Execution",
		"Strategy",
		"Craft",
	]) {
		check(
			`copy "${text}"`,
			(await page.getByText(text, { exact: false }).count()) > 0,
		);
	}

	// Scroll to bottom to trigger useInView animations, then confirm they settle.
	await page.evaluate(async () => {
		for (let y = 0; y <= document.body.scrollHeight; y += 400) {
			window.scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 60));
		}
	});
	await page.waitForTimeout(1400);
	const aboutOpacity = await page
		.locator("h2", { hasText: "Pioneering" })
		.evaluate((el) => getComputedStyle(el).opacity);
	check(
		"AboutSection animated in (opacity 1)",
		aboutOpacity === "1",
		aboutOpacity,
	);
	const cardOpacity = await page
		.locator("article", { hasText: "Research & Insight" })
		.evaluate((el) => getComputedStyle(el).opacity);
	check(
		"Service card animated in (opacity 1)",
		cardOpacity === "1",
		cardOpacity,
	);

	// --- Hero crossfade wiring (network-dependent: soft-check) ---
	const heroOpacity = await heroVideo.evaluate((v) => v.style.opacity);
	console.log(
		`[INFO] hero video inline opacity after load: ${heroOpacity} (0 until canplay, then fades to 1)`,
	);

	// --- Console errors ---
	const realErrors = consoleErrors.filter(
		(e) => !/favicon|net::|Failed to load resource/i.test(e),
	);
	check(
		"no console/page errors",
		realErrors.length === 0,
		realErrors.join(" | ") || "clean",
	);

	// --- Mobile viewport smoke check ---
	const mobile = await browser.newPage({
		viewport: { width: 390, height: 844 },
	});
	await mobile.goto(baseUrl, { waitUntil: "load" });
	check(
		"mobile: nav links hidden",
		!(await mobile
			.locator("nav a", { hasText: "Features" })
			.first()
			.isVisible()
			.catch(() => false)),
	);
	check("mobile: hero heading visible", await mobile.locator("h1").isVisible());
	check(
		'mobile: "Our services" label hidden',
		!(await mobile
			.getByText("Our services", { exact: true })
			.isVisible()
			.catch(() => false)),
	);
	await mobile.close();
} finally {
	await browser.close();
	await server.close();
}

console.log(
	failures.length === 0
		? "\nALL CHECKS PASSED"
		: `\n${failures.length} CHECK(S) FAILED`,
);
process.exit(failures.length === 0 ? 0 : 1);
