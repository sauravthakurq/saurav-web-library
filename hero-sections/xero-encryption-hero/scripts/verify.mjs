/**
 * Headless CLI verification for the Xero landing hero.
 *
 * Usage:
 *   npm run build && npm run preview -- --port 4317 &
 *   npm install --no-save playwright
 *   node scripts/verify.mjs
 *
 * Checks structure, computed styles, the beam state machine (active
 * classes, splash, beam hide/show, gradient mutation) and the mobile
 * hamburger menu — all without a GUI.
 */
import { chromium } from "playwright";

const BASE = process.env.URL ?? "http://localhost:4317";
const SHOT_DIR = process.env.SHOT_DIR ?? "/tmp/xero-verify";

const errors = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => {
	if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(BASE, { waitUntil: "networkidle" });

const title = await page.title();

const checks = {
	navGrid: await page.$eval(
		"nav",
		(el) => getComputedStyle(el).gridTemplateColumns,
	),
	bodyFont: await page.$eval("body", (el) => getComputedStyle(el).fontFamily),
	bodyPadding: await page.$eval("body", (el) => getComputedStyle(el).padding),
	heroCardRadius: await page.$eval(
		".hero-card",
		(el) => getComputedStyle(el).borderRadius,
	),
	heroCardBg: await page.$eval(
		".hero-card",
		(el) => getComputedStyle(el).backgroundColor,
	),
	heroGridMask: await page.$eval(
		".hero-grid",
		(el) =>
			getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage,
	),
	navLinks: await page.$$eval(".nav-links a", (els) =>
		els.map((a) => a.textContent),
	),
	brandCount: await page.$$eval(".brand-item", (els) => els.length),
	brandTexts: await page.$$eval(".brand-item", (els) =>
		els.map((b) => b.textContent?.trim()),
	),
	hubspotDot: await page.$eval(".hubspot-dot", (el) => {
		const r = el.getBoundingClientRect();
		return `${r.width}x${r.height}`;
	}),
	beamD: await page.$eval(".beam-svg path", (el) => el.getAttribute("d")),
	splashSize: await page.$eval(".splash", (el) => {
		const s = getComputedStyle(el);
		return `${s.width} ${s.height}`;
	}),
	headingWeight: await page.$eval(
		".hero-heading",
		(el) => getComputedStyle(el).fontWeight,
	),
	strongClip: await page.$eval(
		".hero-heading strong",
		(el) => getComputedStyle(el).webkitTextFillColor,
	),
};

// Sample the gradient window position several times across ~2s.
const gradientSamples = [];
for (let i = 0; i < 5; i++) {
	gradientSamples.push(
		await page.$eval("#beam-gradient", (el) => el.getAttribute("x1")),
	);
	await page.waitForTimeout(400);
}

// Observe one full state-machine cycle (~3.4s) for phase side effects.
const observed = await page.evaluate(
	() =>
		new Promise((resolve) => {
			const seen = {
				stackActive: false,
				shieldActive: false,
				splashAnimate: false,
				beamHidden: false,
				beamRestored: false,
			};
			const stack = document.getElementById("node-stack");
			const shield = document.getElementById("node-shield");
			const splash = document.querySelector(".splash");
			const core = document.querySelector(".beam-svg > path");
			const iv = setInterval(() => {
				if (stack?.classList.contains("active")) seen.stackActive = true;
				if (shield?.classList.contains("active")) seen.shieldActive = true;
				if (splash?.classList.contains("animate")) seen.splashAnimate = true;
				if (core instanceof SVGPathElement) {
					if (core.style.opacity === "0") seen.beamHidden = true;
					if (seen.beamHidden && core.style.opacity === "1")
						seen.beamRestored = true;
				}
			}, 30);
			setTimeout(() => {
				clearInterval(iv);
				resolve(seen);
			}, 4200);
		}),
);

await page.screenshot({ path: `${SHOT_DIR}/desktop.png`, fullPage: true });

// Mobile checks
await page.setViewportSize({ width: 420, height: 820 });
await page.waitForTimeout(400);
const mobile = {};
mobile.toggleVisible = await page.$eval(
	".menu-toggle",
	(el) => getComputedStyle(el).display !== "none",
);
mobile.nodeSize = await page.$eval(
	".icon-node",
	(el) => getComputedStyle(el).width,
);
mobile.centerSize = await page.$eval(
	".icon-node-center",
	(el) => getComputedStyle(el).width,
);
mobile.beamDRecomputed = await page.$eval(".beam-svg path", (el) =>
	el.getAttribute("d"),
);
await page.screenshot({ path: `${SHOT_DIR}/mobile.png`, fullPage: true });

await page.click(".menu-toggle");
await page.waitForTimeout(550);
mobile.menuActive = await page.$eval(".nav-menu", (el) =>
	el.classList.contains("active"),
);
mobile.menuRight = await page.$eval(
	".nav-menu",
	(el) => getComputedStyle(el).right,
);
mobile.toggleActive = await page.$eval(".menu-toggle", (el) =>
	el.classList.contains("active"),
);
mobile.bodyOverflow = await page.evaluate(() => document.body.style.overflow);
await page.screenshot({ path: `${SHOT_DIR}/mobile-menu.png` });

await page.click(".menu-toggle");
await page.waitForTimeout(550);
mobile.menuClosed = await page.$eval(
	".nav-menu",
	(el) => !el.classList.contains("active"),
);
mobile.bodyOverflowRestored = await page.evaluate(
	() => document.body.style.overflow === "",
);

await browser.close();

const report = {
	title,
	checks,
	gradientSamples,
	observed,
	mobile,
	consoleErrors: errors,
};
console.log(JSON.stringify(report, null, 2));

const failures = [];
if (
	!/^M -?[\d.]+,-?[\d.]+ L -?[\d.]+,-?[\d.]+ L -?[\d.]+,-?[\d.]+$/.test(
		checks.beamD ?? "",
	)
) {
	failures.push(`beam path d malformed: ${checks.beamD}`);
}
if (new Set(gradientSamples).size < 2)
	failures.push("gradient x1 never changed");
for (const [k, v] of Object.entries(observed))
	if (!v) failures.push(`state machine: ${k} never observed`);
if (checks.brandCount !== 5)
	failures.push(`expected 5 brands, got ${checks.brandCount}`);
if (checks.navGrid === "none") failures.push("nav is not a grid on desktop");
if (!checks.bodyFont.includes("Inter"))
	failures.push(`body font is ${checks.bodyFont}`);
if (!mobile.toggleVisible) failures.push("hamburger not visible on mobile");
if (!mobile.menuActive || mobile.menuRight !== "0px")
	failures.push("mobile menu did not slide in");
if (mobile.bodyOverflow !== "hidden")
	failures.push("body overflow not locked while menu open");
if (!mobile.menuClosed || !mobile.bodyOverflowRestored)
	failures.push("mobile menu did not close cleanly");
if (mobile.beamDRecomputed === checks.beamD)
	failures.push("beam path not recomputed on resize");
if (errors.length) failures.push(`console/page errors: ${errors.join(" | ")}`);

if (failures.length) {
	console.error(`\nFAILURES:\n- ${failures.join("\n- ")}`);
	process.exit(1);
}
console.log("\nALL CHECKS PASSED");
