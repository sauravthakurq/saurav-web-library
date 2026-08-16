// CLI verification for nhm-paleontology-landing (headless chromium via playwright).
// Usage: node scripts/verify.mjs [url]
// Requires playwright to be resolvable: either `npm i -D playwright` in this
// project, or an install in a sibling project of this repo.

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
	path.join(here, ".."), // this project
	path.join(here, "..", "..", "skyelite-jet-hero"), // sibling, repo checkout
	path.join(here, "..", "..", "..", "..", "..", "skyelite-jet-hero"), // sibling, from .claude/worktrees/<name>
];
const base = candidates.find((c) =>
	existsSync(path.join(c, "node_modules", "playwright", "package.json")),
);
if (!base) {
	console.error("playwright not found — run `npm i -D playwright` first");
	process.exit(2);
}
const require = createRequire(path.join(base, "node_modules", "x.js"));
const { chromium } = require("playwright");

const URL = process.argv[2] ?? "http://localhost:4185/";
const results = [];
const check = (name, ok, detail = "") => {
	results.push({ name, ok, detail });
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
};

const browser = await chromium.launch();
const consoleErrors = [];
const pageErrors = [];

// ---------- Desktop pass ----------
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });

check("page title", (await page.title()).includes("NHM"), await page.title());

// 1A. Logo: 3 + 3 + 4 = 10 polygons in the NHM svg
const polyCount = await page.locator("h1 svg polygon").count();
check("NHM logo has 10 polygons", polyCount === 10, `count=${polyCount}`);

// 1B. Sub-nav
check(
	"sub-nav Natura/History/Museum",
	await page.getByText("Natura", { exact: true }).isVisible(),
);
for (const link of ["Visit", "Exhibitions", "Discover", "Learn", "About"]) {
	const c = await page.locator(`nav >> text=${link}`).count();
	check(`nav link "${link}" present`, c >= 1, `count=${c}`);
}

// 1E. Hero copy + CTA
check(
	"TIMELESS WONDERS headline",
	await page.getByText("TIMELESS").isVisible(),
);
check(
	"Explore Now CTA",
	await page.getByRole("button", { name: /Explore Now/ }).isVisible(),
);

// 1F. Right sidebar
check(
	"Tyrannosaurus Rex specimen",
	await page.getByText("Tyrannosaurus Rex").isVisible(),
);
check("Length stat 12.3 m", await page.getByText("12.3 m").isVisible());
check("View Details button", await page.getByText("View Details").isVisible());

// 1G. Scroll to explore
check(
	"Scroll to explore",
	await page.getByText("Scroll to explore").isVisible(),
);

// 1D. Background video appears after 2800ms
const videoBefore = await page.locator("video").count();
await page.waitForTimeout(3300);
const videoAfter = await page.locator("video").count();
check(
	"video absent before 2.8s, present after",
	videoBefore === 0 && videoAfter === 1,
	`before=${videoBefore} after=${videoAfter}`,
);
const videoSrc = await page.locator("video").getAttribute("src");
check(
	"video src is cloudinary mp4",
	/res\.cloudinary\.com.+\.mp4$/.test(videoSrc || ""),
);
const videoPlaying = await page
	.locator("video")
	.evaluate((v) => !v.paused && v.readyState >= 2)
	.catch(() => false);
check(
	"video is playing (autoplay muted)",
	videoPlaying,
	`playing=${videoPlaying}`,
);

// Section 2
check(
	"[ 02 ] section label",
	await page.getByText("Explore Our World").first().isVisible(),
);
await page.getByText("Unearth the stories").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
check(
	"section 2 heading revealed",
	await page.getByText("Unearth the stories").isVisible(),
);
for (const pill of [
	"Dinosaurs",
	"Ancient Life",
	"Minerals",
	"Fossils",
	"Learn More",
]) {
	check(
		`pill "${pill}"`,
		(await page.locator(`button:has-text("${pill}")`).count()) >= 1,
	);
}
check(
	"WE DON'T JUST TELL STORIES.",
	(await page.getByText("WE DON'T JUST TELL STORIES.").count()) === 1,
);
check(
	"PALEONTOLOGY (C) 2026",
	(await page.getByText("PALEONTOLOGY (C) 2026").count()) === 1,
);

// Section 3
await page.getByText("Curated from millions").scrollIntoViewIfNeeded();
await page.waitForTimeout(1800);
check(
	"section 3 heading",
	await page.getByText("Curated from millions").isVisible(),
);
const ptero = page.locator('img[src*="ChatGPT_Image"]');
check("pterodactyl image present", (await ptero.count()) === 1);
const pteroOpacity = await ptero.evaluate((el) => getComputedStyle(el).opacity);
check(
	"pterodactyl revealed (opacity → 1)",
	Number(pteroOpacity) > 0.9,
	`opacity=${pteroOpacity}`,
);
for (const pill of ["Educational", "Authentic", "Inspiring"]) {
	check(
		`dark pill "${pill}"`,
		(await page.locator(`button:has-text("${pill}")`).count()) === 1,
	);
}

// 3C. chapters
const chapterNames = [
	"Age of Dinosaurs",
	"Fossils of Ancient Life",
	"Reptiles of the Mesozoic",
	"Marine Fossil Gallery",
	"Prehistoric Giants",
];
for (const name of chapterNames) {
	check(
		`chapter "${name}"`,
		(await page.locator(`button:has-text("${name}")`).count()) === 1,
	);
}

// SandTransitionImage: filter applied + svg filter primitives present
const sandImg = page.locator('img[crossorigin="anonymous"]').first();
const sandFilter = await sandImg.evaluate((el) => el.style.filter);
check(
	"sand image uses svg filter",
	/url\(["']?#sand-filter/.test(sandFilter),
	sandFilter,
);
check(
	"feTurbulence present",
	(await page.locator("feTurbulence").count()) >= 1,
);
check(
	"feDisplacementMap present",
	(await page.locator("feDisplacementMap").count()) >= 1,
);

// Clicking a chapter activates it
await page.locator('button:has-text("Age of Dinosaurs")').click();
await page.waitForTimeout(400);
const activeClass = await page
	.locator('button:has-text("Age of Dinosaurs")')
	.getAttribute("class");
check(
	"clicking chapter activates it",
	/text-white/.test(activeClass || ""),
	"has text-white",
);
const counterText = await page.locator("text=/^01$/").count();
check("counter shows 01 after click", counterText >= 1, `count=${counterText}`);

// Auto-cycle: wait >3.5s and confirm active chapter changed
await page.waitForTimeout(3800);
const activeAfterCycle = await page
	.locator('button:has-text("Age of Dinosaurs")')
	.getAttribute("class");
check(
	"auto-cycle advances chapter",
	!/text-white/.test(activeAfterCycle || ""),
);

// Footer
check(
	"DIGGING INTO OUR PLANET'S PAST",
	await page.getByText("DIGGING INTO OUR PLANET'S PAST").isVisible(),
);

await page.screenshot({
	path: path.join(here, "verify-desktop.png"),
	fullPage: true,
});
await page.close();

// ---------- Mobile pass ----------
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
mob.on("pageerror", (e) => pageErrors.push(String(e)));
await mob.goto(URL, { waitUntil: "networkidle" });
await mob.waitForTimeout(1500);

check(
	"mobile: hamburger visible",
	await mob.getByRole("button", { name: "Open menu" }).isVisible(),
);
check(
	"mobile: desktop nav hidden",
	!(await mob.locator("header nav").first().isVisible()),
);
await mob.getByRole("button", { name: "Open menu" }).click();
await mob.waitForTimeout(600);
const visibleVisitOpen = await mob
	.locator('header a:has-text("Visit"):visible')
	.count();
check(
	"mobile: menu opens with links",
	visibleVisitOpen === 1,
	`visible=${visibleVisitOpen}`,
);
await mob.getByRole("button", { name: "Close menu" }).click();
await mob.waitForTimeout(600);
const visibleVisitClosed = await mob
	.locator('header a:has-text("Visit"):visible')
	.count();
check(
	"mobile: menu closes",
	visibleVisitClosed === 0,
	`visible=${visibleVisitClosed}`,
);
check(
	"mobile: right sidebar hidden",
	!(await mob.getByText("Tyrannosaurus Rex").isVisible()),
);
await mob.screenshot({
	path: path.join(here, "verify-mobile.png"),
	fullPage: false,
});
await mob.close();

await browser.close();

// ---------- Summary ----------
const failed = results.filter((r) => !r.ok);
console.log("\n=== SUMMARY ===");
console.log(
	`checks: ${results.length}, passed: ${results.length - failed.length}, failed: ${failed.length}`,
);
// Media is remote; tolerate network-load console errors but report them.
const realConsoleErrors = consoleErrors.filter(
	(e) => !/net::|Failed to load resource/i.test(e),
);
console.log(`page JS errors: ${pageErrors.length}`);
console.log(`console errors (non-network): ${realConsoleErrors.length}`);
if (consoleErrors.length)
	console.log("console (all):", consoleErrors.slice(0, 5));
if (pageErrors.length) console.log("pageErrors:", pageErrors.slice(0, 5));
if (failed.length || pageErrors.length || realConsoleErrors.length) {
	console.log("VERIFICATION FAILED");
	process.exit(1);
}
console.log("VERIFICATION PASSED");
