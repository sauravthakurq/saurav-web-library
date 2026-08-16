/**
 * Headless end-to-end verification of the built landing page.
 * Spawns `vite preview` over ./dist, drives Chromium via Playwright,
 * and asserts every prompt requirement that is observable in the DOM.
 *
 * Run with: node scripts/verify.mjs
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

const PORT = 4317;
const URL = `http://localhost:${PORT}/`;

const failures = [];
const passes = [];
const check = (name, ok, detail = "") => {
	(ok ? passes : failures).push(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
};

// ——— start preview server ———
const server = spawn(
	"npx",
	["vite", "preview", "--port", String(PORT), "--strictPort"],
	{
		stdio: "pipe",
	},
);
await new Promise((resolve, reject) => {
	const timer = setTimeout(
		() => reject(new Error("preview server timeout")),
		15000,
	);
	server.stdout.on("data", (d) => {
		if (d.toString().includes("localhost")) {
			clearTimeout(timer);
			resolve();
		}
	});
	server.on("error", reject);
});

const browser = await chromium.launch({
	args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (err) => pageErrors.push(err.message));
page.on("console", (msg) => {
	if (msg.type() === "error") consoleErrors.push(msg.text());
});

try {
	await page
		.goto(URL, { waitUntil: "networkidle", timeout: 45000 })
		.catch(async () => {
			// networkidle may never settle while videos stream; fall back to load.
			await page.goto(URL, { waitUntil: "load", timeout: 45000 });
		});
	await page.waitForTimeout(2500);
	await mkdir("screenshots", { recursive: true });

	// ——— global theme ———
	const bodyBg = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	);
	check("body background is pure black", bodyBg === "rgb(0, 0, 0)", bodyBg);

	const fonts = await page.evaluate(() => ({
		sans: getComputedStyle(document.body).fontFamily,
		serif: getComputedStyle(document.querySelector("h1 em")).fontFamily,
		serifStyle: getComputedStyle(document.querySelector("h1 em")).fontStyle,
	}));
	check("body font is Inter", fonts.sans.includes("Inter"), fonts.sans);
	check(
		"hero accent word is italic Instrument Serif",
		fonts.serif.includes("Instrument Serif") && fonts.serifStyle === "italic",
		`${fonts.serif} / ${fonts.serifStyle}`,
	);

	check(
		"page title",
		(await page.title()).includes("Mindloop"),
		await page.title(),
	);

	// ——— navbar ———
	const navLinks = await page.$$eval("header nav a[href^='#']", (as) =>
		as.map((a) => a.textContent.trim()).filter(Boolean),
	);
	check(
		"navbar has logo + 4 nav links",
		["Home", "How It Works", "Philosophy", "Use Cases"].every((l) =>
			navLinks.includes(l),
		),
		navLinks.join(", "),
	);
	const socialCount = await page.locator("header a.liquid-glass").count();
	check(
		"navbar has 3 liquid-glass social buttons",
		socialCount === 3,
		`count=${socialCount}`,
	);
	const headerPos = await page.evaluate(
		() => getComputedStyle(document.querySelector("header")).position,
	);
	check("navbar is fixed", headerPos === "fixed", headerPos);

	// ——— hero ———
	const h1 = (await page.locator("h1").textContent())
		.replace(/\s+/g, " ")
		.trim();
	check("hero heading text", h1 === "Get Inspired with Us", h1);

	const heroVideo = await page.evaluate(() => {
		const v = document.querySelector("#home video");
		return v
			? {
					src: v.src,
					muted: v.muted,
					loop: v.loop,
					autoplay: v.autoplay,
					readyState: v.readyState,
					paused: v.paused,
				}
			: null;
	});
	check(
		"hero MP4 background video configured (muted/loop/autoplay)",
		!!heroVideo &&
			heroVideo.src.includes("hf_20260325_120549") &&
			heroVideo.muted &&
			heroVideo.loop &&
			heroVideo.autoplay,
		JSON.stringify(heroVideo),
	);
	check(
		"hero video stream loaded & playing",
		!!heroVideo && heroVideo.readyState >= 2 && !heroVideo.paused,
		`readyState=${heroVideo?.readyState} paused=${heroVideo?.paused}`,
	);

	const avatars = await page.$$eval("#home img", (imgs) =>
		imgs.map((i) => ({ w: i.naturalWidth, cls: i.className })),
	);
	check(
		"3 avatars rendered and decoded",
		avatars.length === 3 && avatars.every((a) => a.w > 0),
		JSON.stringify(avatars.map((a) => a.w)),
	);
	check(
		"social proof line",
		(await page.locator("#home").textContent()).includes(
			"7,000+ people already subscribed",
		),
	);

	// subscribe flow
	await page.fill("#hero-email", "reader@example.com");
	await page.click("#home form button[type=submit]");
	await page.waitForTimeout(400);
	const btnText = await page
		.locator("#home form button[type=submit]")
		.textContent();
	check(
		"subscribe interaction works",
		btnText.includes("SUBSCRIBED"),
		btnText.trim(),
	);

	await page.screenshot({ path: "screenshots/01-hero.png" });

	// ——— search has changed ———
	const searchHeading = (await page.locator("#how-it-works h2").textContent())
		.replace(/\s+/g, " ")
		.trim();
	check(
		"search section heading",
		searchHeading.includes("Search has changed.") &&
			searchHeading.includes("Have you?"),
		searchHeading,
	);

	const platformNames = await page.$$eval("#how-it-works h3", (hs) =>
		hs.map((h) => h.textContent.trim()),
	);
	check(
		"3 platform cards (ChatGPT / Perplexity / Google AI)",
		["ChatGPT", "Perplexity", "Google AI"].every((n) =>
			platformNames.includes(n),
		),
		platformNames.join(", "),
	);
	const platformIcons = await page.$$eval("#how-it-works img", (imgs) =>
		imgs.map((i) => ({ w: i.naturalWidth, rendered: i.width })),
	);
	check(
		"platform icons decoded at 200px",
		platformIcons.length === 3 &&
			platformIcons.every((i) => i.w > 0 && i.rendered === 200),
		JSON.stringify(platformIcons),
	);
	check(
		"bottom tagline",
		(await page.locator("#how-it-works").textContent()).includes(
			"If you don't answer the questions, someone else will.",
		),
	);

	await page.locator("#how-it-works h2").scrollIntoViewIfNeeded();
	await page.waitForTimeout(900);
	await page.screenshot({ path: "screenshots/02-search.png" });

	// ——— mission: scroll-driven word reveal ———
	const missionVideoOk = await page.evaluate(() => {
		const v = document.querySelector("#philosophy video");
		return !!v && v.src.includes("hf_20260325_132944") && v.muted && v.loop;
	});
	check("mission 800x800 video configured", missionVideoOk);

	const probe = async () =>
		page.evaluate(() => {
			const words = document.querySelectorAll("#philosophy p span");
			return {
				count: words.length,
				first: Number(getComputedStyle(words[0]).opacity),
				last: Number(getComputedStyle(words[words.length - 1]).opacity),
			};
		});

	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(600);
	const before = await probe();
	await page.locator("#philosophy p").first().scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	const mid = await probe();
	await page.locator("#use-cases").scrollIntoViewIfNeeded();
	await page.waitForTimeout(600);
	const after = await probe();
	check(
		"mission words start dimmed (~0.15) before scroll",
		before.count > 30 && before.first <= 0.2,
		`count=${before.count} first=${before.first}`,
	);
	check(
		"scroll reveals words (first word brightens mid-scroll)",
		mid.first > before.first,
		`before=${before.first} mid=${mid.first}`,
	);
	check(
		"all words fully revealed after section scrolled past",
		after.first >= 0.95 && after.last >= 0.95,
		`first=${after.first} last=${after.last}`,
	);

	await page.locator("#philosophy p").first().scrollIntoViewIfNeeded();
	await page.waitForTimeout(900);
	await page.screenshot({ path: "screenshots/03-mission.png" });

	// ——— solution ———
	const solutionVideoOk = await page.evaluate(() => {
		const v = document.querySelector("#use-cases video");
		return !!v && v.src.includes("hf_20260325_125119");
	});
	check("solution 3:1 video configured", solutionVideoOk);
	const features = await page.$$eval("#use-cases h3", (hs) =>
		hs.map((h) => h.textContent.trim()),
	);
	check(
		"4 feature columns",
		["Curated Feed", "Writer Tools", "Community", "Distribution"].every((f) =>
			features.includes(f),
		),
		features.join(", "),
	);
	await page.locator("#use-cases h2").scrollIntoViewIfNeeded();
	await page.waitForTimeout(900);
	await page.screenshot({ path: "screenshots/04-solution.png" });

	// ——— CTA: HLS video ———
	await page.evaluate(() => {
		document.querySelectorAll("section")[4]?.scrollIntoView();
	});
	await page.waitForTimeout(4000); // allow lazy hls.js chunk + manifest + first segments
	const ctaVideo = await page.evaluate(() => {
		const sections = document.querySelectorAll("main > section");
		const v = sections[sections.length - 1].querySelector("video");
		return v
			? { src: v.src, readyState: v.readyState, paused: v.paused }
			: null;
	});
	check(
		"CTA video attached via hls.js (MSE blob source)",
		!!ctaVideo && ctaVideo.src.startsWith("blob:"),
		JSON.stringify(ctaVideo),
	);
	check(
		"CTA HLS stream buffering/playing",
		!!ctaVideo && ctaVideo.readyState >= 2 && !ctaVideo.paused,
		`readyState=${ctaVideo?.readyState} paused=${ctaVideo?.paused}`,
	);
	const ctaText = await page.evaluate(() => {
		const sections = document.querySelectorAll("main > section");
		return sections[sections.length - 1].textContent;
	});
	check(
		"CTA heading + dual buttons",
		ctaText.includes("Start Your Journey") &&
			ctaText.includes("Subscribe Now") &&
			ctaText.includes("Start Writing"),
	);
	await page.waitForTimeout(800);
	await page.screenshot({ path: "screenshots/05-cta.png" });

	// ——— footer ———
	const footerText = await page.locator("footer").textContent();
	check(
		"footer copy + links",
		footerText.includes("© 2026 Mindloop. All rights reserved.") &&
			["Privacy", "Terms", "Contact"].every((l) => footerText.includes(l)),
	);

	// ——— liquid glass + monochrome audit ———
	const glassCount = await page.locator(".liquid-glass").count();
	check(
		"liquid-glass elements present (nav x3, hero form, CTA button)",
		glassCount >= 5,
		`count=${glassCount}`,
	);

	const offenders = await page.evaluate(() => {
		const bad = [];
		for (const el of document.querySelectorAll("body *")) {
			if (el.closest("video")) continue;
			const { color, backgroundColor } = getComputedStyle(el);
			for (const c of [color, backgroundColor]) {
				const m = c.match(/rgba?\((\d+), (\d+), (\d+)/);
				if (m) {
					const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
					if (Math.max(r, g, b) - Math.min(r, g, b) > 12) {
						bad.push(`${el.tagName}.${el.className} → ${c}`);
					}
				}
			}
		}
		return [...new Set(bad)].slice(0, 5);
	});
	check(
		"monochrome audit (no saturated colors in computed styles)",
		offenders.length === 0,
		offenders.join(" | "),
	);

	// ——— responsive smoke test ———
	await page.setViewportSize({ width: 390, height: 844 });
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(900);
	const mobileOverflow = await page.evaluate(
		() =>
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth + 1,
	);
	check("no horizontal overflow at 390px", !mobileOverflow);
	await page.screenshot({ path: "screenshots/06-mobile-hero.png" });

	// ——— error budget ———
	check(
		"no uncaught page errors",
		pageErrors.length === 0,
		pageErrors.join(" | "),
	);
	const realConsoleErrors = consoleErrors.filter(
		(e) => !/net::|Failed to load resource/i.test(e),
	);
	check(
		"no console errors (network noise excluded)",
		realConsoleErrors.length === 0,
		realConsoleErrors.join(" | "),
	);
	if (consoleErrors.length)
		console.log("ℹ️ network console noise:", consoleErrors.slice(0, 3));
} finally {
	await browser.close();
	server.kill("SIGTERM");
}

console.log(`\n${passes.length} passed, ${failures.length} failed`);
if (failures.length) {
	console.log(failures.join("\n"));
	process.exit(1);
}
