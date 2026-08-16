/* CLI verification: serves the production build and asserts the rendered
   page matches the spec using headless Chromium. */

import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const DIST = join(import.meta.dirname, "..", "dist");
const MIME = {
	".html": "text/html",
	".js": "text/javascript",
	".css": "text/css",
	".svg": "image/svg+xml",
};

const server = createServer((req, res) => {
	let file = join(DIST, req.url === "/" ? "index.html" : req.url);
	if (!existsSync(file)) file = join(DIST, "index.html");
	res.setHeader(
		"Content-Type",
		MIME[extname(file)] ?? "application/octet-stream",
	);
	res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4173, r));

const VIDEO_URL =
	"/assets/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures++;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });

// --- Background video ---
const video = page.locator("video");
check("video element present", (await video.count()) === 1);
check("video src exact", (await video.getAttribute("src")) === VIDEO_URL);
check("video autoplay", (await video.getAttribute("autoplay")) !== null);
check("video muted prop", await video.evaluate((v) => v.muted));
check("video loop", (await video.getAttribute("loop")) !== null);
check("video playsinline", (await video.getAttribute("playsinline")) !== null);
const vidStyle = await video.evaluate((v) => {
	const s = getComputedStyle(v);
	return { position: s.position, objectFit: s.objectFit, inset: s.inset };
});
check(
	"video absolute + object-cover",
	vidStyle.position === "absolute" && vidStyle.objectFit === "cover",
	JSON.stringify(vidStyle),
);
const playing = await video.evaluate(
	(v) =>
		new Promise((resolve) => {
			if (!v.paused && v.currentTime > 0) return resolve(true);
			v.addEventListener("timeupdate", () => resolve(true), { once: true });
			setTimeout(() => resolve(!v.paused), 8000);
		}),
);
check("video is actually playing", playing);

// --- Root + foreground wrappers ---
const rootBg = await page.evaluate(
	() => getComputedStyle(document.querySelector("#root > div")).backgroundColor,
);
check("root bg #f0f0ee", rootBg === "rgb(240, 240, 238)", rootBg);
const fgZ = await page.evaluate(() => {
	const el = document.querySelector("#root > div > div:not(video)");
	const s = getComputedStyle(el);
	return { z: s.zIndex, display: s.display, dir: s.flexDirection };
});
check(
	"foreground z-10 flex-col",
	fgZ.z === "10" && fgZ.display === "flex" && fgZ.dir === "column",
	JSON.stringify(fgZ),
);

// --- Logo SVG ---
const svg = page.locator("nav svg");
check(
	"logo svg 18x18 viewBox 256",
	(await svg.getAttribute("width")) === "18" &&
		(await svg.getAttribute("height")) === "18" &&
		(await svg.getAttribute("viewBox")) === "0 0 256 256",
);
const pathFill = await page.locator("nav svg path").getAttribute("fill");
check("logo path fill rgb(84,84,84)", pathFill === "rgb(84, 84, 84)", pathFill);
const pathD = await page.locator("nav svg path").getAttribute("d");
check(
	"logo path d starts/ends correctly",
	pathD.startsWith("M 160 88") && pathD.endsWith("Z"),
);

// --- Navbar ---
const navLinks = await page.locator("nav a").allTextContents();
check(
	"nav links Story/Products/Help/Support",
	JSON.stringify(navLinks) ===
		JSON.stringify(["Story", "Products", "Help", "Support"]),
	JSON.stringify(navLinks),
);
const pillBgs = await page.evaluate(() =>
	[...document.querySelectorAll("nav > div")].map(
		(d) => getComputedStyle(d).backgroundColor,
	),
);
check(
	"both pills #EDEDED",
	pillBgs.length === 2 && pillBgs.every((c) => c === "rgb(237, 237, 237)"),
	JSON.stringify(pillBgs),
);
const logoPill = await page.evaluate(() => {
	const d = document.querySelector("nav > div");
	const s = getComputedStyle(d);
	return { radius: s.borderRadius, w: d.offsetWidth, h: d.offsetHeight };
});
check(
	"logo pill circular 44px (sm:w-11)",
	logoPill.w === 44 && logoPill.h === 44,
	JSON.stringify(logoPill),
);
const navLinkSize = await page.evaluate(
	() => getComputedStyle(document.querySelector("nav a")).fontSize,
);
check("nav link 14px at desktop", navLinkSize === "14px", navLinkSize);

// --- Hero content ---
const badge = page.locator("a", { hasText: "Seen on Shark Tank in India" });
check(
	"badge text + arrow",
	(await badge.count()) === 1 && (await badge.textContent()).includes("→"),
);
const badgeSize = await badge.evaluate((el) => getComputedStyle(el).fontSize);
check("badge 11.5px", badgeSize === "11.5px", badgeSize);

const h1 = page.locator("h1");
check(
	"headline text",
	(await h1.textContent()).trim() ===
		"Simple, smart prosthetics made for people who keep fighting.",
);
const h1Style = await h1.evaluate((el) => {
	const s = getComputedStyle(el);
	return { size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight };
});
check(
	"headline 1.75rem(28px)/500 at desktop",
	h1Style.size === "28px" && h1Style.weight === "500",
	JSON.stringify(h1Style),
);

const sub = page.locator("p", { hasText: "Reclaim your movement now." });
check("subtext present", (await sub.count()) === 1);
const subStyle = await sub.evaluate((el) => {
	const s = getComputedStyle(el);
	return { size: s.fontSize, color: s.color };
});
check(
	"subtext 13px gray-400",
	subStyle.size === "13px" && subStyle.color === "rgb(156, 163, 175)",
	JSON.stringify(subStyle),
);

const cta = page.locator("a", { hasText: "Try a free fitting" });
check(
	"CTA text + arrow",
	(await cta.count()) === 1 && (await cta.textContent()).includes("→"),
);
const ctaBefore = await cta.evaluate((el) => {
	const s = getComputedStyle(el);
	return {
		bg: s.backgroundColor,
		color: s.color,
		border: s.borderColor,
		radius: s.borderRadius,
	};
});
check(
	"CTA resting: blue-500 text, blue-400 border",
	ctaBefore.color === "rgb(59, 130, 246)" &&
		ctaBefore.border === "rgb(96, 165, 250)",
	JSON.stringify(ctaBefore),
);

// --- Hover micro-interactions ---
await cta.hover();
await page.waitForTimeout(350);
const ctaAfter = await cta.evaluate((el) => {
	const s = getComputedStyle(el);
	return { bg: s.backgroundColor, color: s.color };
});
check(
	"CTA hover fills blue-500 / white text",
	ctaAfter.bg === "rgb(59, 130, 246)" &&
		ctaAfter.color === "rgb(255, 255, 255)",
	JSON.stringify(ctaAfter),
);
const arrowTransform = await cta
	.locator("span")
	.evaluate((el) => getComputedStyle(el).transform);
check(
	"CTA arrow translates on hover",
	arrowTransform.includes("matrix") && arrowTransform !== "none",
	arrowTransform,
);

const firstNav = page.locator("nav a").first();
await firstNav.hover();
await page.waitForTimeout(350);
const navHoverColor = await firstNav.evaluate(
	(el) => getComputedStyle(el).color,
);
check(
	"nav link hover gray-900",
	navHoverColor === "rgb(17, 24, 39)",
	navHoverColor,
);

// --- No extra sections ---
const anchors = await page.locator("a").count();
check(
	"exactly 6 anchors (4 nav + badge + CTA)",
	anchors === 6,
	String(anchors),
);
check(
	"no extra h2/section/footer",
	(await page.locator("h2, section, footer, form").count()) === 0,
);

// --- Mobile viewport sanity ---
await page.setViewportSize({ width: 375, height: 720 });
await page.waitForTimeout(200);
const mobNavSize = await page.evaluate(
	() => getComputedStyle(document.querySelector("nav a")).fontSize,
);
check("nav link 12px on mobile", mobNavSize === "12px", mobNavSize);
const mobH1 = await h1.evaluate((el) => getComputedStyle(el).fontSize);
check("headline 24px (1.5rem) on mobile", mobH1 === "24px", mobH1);
const mobLogoPill = await page.evaluate(
	() => document.querySelector("nav > div").offsetWidth,
);
check(
	"logo pill 40px (w-10) on mobile",
	mobLogoPill === 40,
	String(mobLogoPill),
);

await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: "scripts/screenshot-desktop.png" });
await page.setViewportSize({ width: 375, height: 720 });
await page.screenshot({ path: "scripts/screenshot-mobile.png" });

await browser.close();
server.close();

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
