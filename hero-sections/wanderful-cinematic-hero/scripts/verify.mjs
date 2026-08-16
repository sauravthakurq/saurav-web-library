/**
 * CLI-only headless verification for the Wanderful cinematic hero.
 * Drives the cached Playwright Chromium against the vite preview server
 * and asserts every requirement from PROMPT.txt that is observable in DOM.
 *
 * Usage: node scripts/verify.mjs [url] [chromiumPath]
 */
import { chromium } from "playwright-core";

const URL = process.argv[2] ?? "http://localhost:4173/";
const EXECUTABLE =
	process.argv[3] ??
	`${process.env.HOME}/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const VIDEO_SRC =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4";

const results = [];
const check = (name, pass, detail = "") => {
	results.push({ name, pass, detail });
	console.log(
		`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
};

const browser = await chromium.launch({
	executablePath: EXECUTABLE,
	args: ["--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage({
	viewportSize: { width: 1440, height: 900 },
});

const consoleErrors = [];
page.on(
	"console",
	(msg) => msg.type() === "error" && consoleErrors.push(msg.text()),
);
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1800); // let mount fade-ins (1000ms + 300ms delay) finish

// --- Document & root container ---
check("title", (await page.title()).includes("Wanderful"), await page.title());
const bodyBg = await page.evaluate(
	() => getComputedStyle(document.body).backgroundColor,
);
check("body background #000", bodyBg === "rgb(0, 0, 0)", bodyBg);
const bodyFont = await page.evaluate(
	() => getComputedStyle(document.body).fontFamily,
);
check("body font Barlow", bodyFont.includes("Barlow"), bodyFont);
const root = page.locator("#root > div");
const rootClass = await root.getAttribute("class");
check(
	"root container classes",
	["min-h-screen", "bg-black", "text-white", "overflow-x-hidden"].every((c) =>
		rootClass.includes(c),
	),
	rootClass,
);
const rootFont = await root.evaluate((el) => el.style.fontFamily);
check("root inline Inter font", rootFont.includes("Inter"), rootFont);

// --- Video background ---
const video = page.locator("video");
check(
	"video src is exact CloudFront URL",
	(await video.getAttribute("src")) === VIDEO_SRC,
);
const vidProps = await video.evaluate((v) => ({
	autoplay: v.autoplay,
	muted: v.muted,
	loop: v.loop,
	playsInline: v.playsInline,
	readyState: v.readyState,
	playbackRate: v.playbackRate,
	videoWidth: v.videoWidth,
	paused: v.paused,
	objectFit: getComputedStyle(v).objectFit,
}));
check(
	"video autoPlay/muted/loop/playsInline",
	vidProps.autoplay && vidProps.muted && vidProps.loop && vidProps.playsInline,
	JSON.stringify(vidProps),
);
check("video object-cover", vidProps.objectFit === "cover", vidProps.objectFit);
check(
	"video metadata loaded (network OK)",
	vidProps.readyState >= 1,
	`readyState=${vidProps.readyState}, videoWidth=${vidProps.videoWidth}`,
);
check(
	"playbackRate = 1.25 on loadedmetadata",
	vidProps.playbackRate === 1.25,
	String(vidProps.playbackRate),
);
const t1 = await video.evaluate((v) => v.currentTime);
await page.waitForTimeout(700);
const t2 = await video.evaluate((v) => v.currentTime);
check(
	"video is actually playing",
	t2 > t1,
	`currentTime ${t1.toFixed(2)} → ${t2.toFixed(2)}`,
);

const wrapper = page.locator("video").locator(".."); // scale-[1.08] parallax wrapper
const wrapClass = await wrapper.getAttribute("class");
check(
	"wrapper scale-[1.08] origin-center",
	wrapClass.includes("scale-[1.08]") && wrapClass.includes("origin-center"),
	wrapClass,
);
const fixedLayer = await page.locator("div.fixed.inset-0.z-0").count();
check("video layer fixed inset-0 z-0", fixedLayer === 1);

// --- GSAP mouse parallax ---
const before = await wrapper.evaluate((el) => getComputedStyle(el).transform);
await page.mouse.move(60, 60);
await page.waitForTimeout(1200); // lerp 0.06/frame needs time to travel
const after = await wrapper.evaluate((el) => getComputedStyle(el).transform);
const [, , , , txA, tyA] = (after.match(/matrix\(([^)]+)\)/)?.[1] ?? "")
	.split(",")
	.map(Number);
check(
	"parallax shifts video on mousemove",
	before !== after && txA < -5 && tyA < -5,
	`${before} → ${after}`,
);

// --- Header ---
const header = page.locator("header");
const headerClass = await header.getAttribute("class");
check(
	"header fixed top z-50 px-10 py-8",
	["fixed", "z-50", "px-10", "py-8", "justify-between", "items-center"].every(
		(c) => headerClass.includes(c),
	),
	headerClass,
);
check(
	"wordmark Wanderful + sup TM",
	(await header.locator("sup", { hasText: "TM" }).count()) === 1 &&
		(await header.locator("a").first().textContent()).startsWith("Wanderful"),
);
for (const link of ["JOURNEY", "BENEFITS", "JOURNAL", "GUIDEBOOK"]) {
	check(
		`nav link ${link}`,
		(await header.locator(`nav a:text-is("${link}")`).count()) === 1,
	);
}
const navGlass = await header
	.locator("nav")
	.evaluate(
		(el) =>
			getComputedStyle(el).backdropFilter ||
			getComputedStyle(el).webkitBackdropFilter,
	);
check(
	"nav liquid-glass backdrop blur(4px)",
	navGlass.includes("blur(4px)"),
	navGlass,
);
check(
	"GET ROAMING liquid-glass anchor",
	(await header
		.locator("a.liquid-glass", { hasText: "GET ROAMING" })
		.count()) === 1,
);

// --- Hero headline ---
const h1 = page.locator("h1");
const h1Style = await h1.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		top: el.style.top,
		fontWeight: cs.fontWeight,
		fontFamily: cs.fontFamily,
		letterSpacing: el.style.letterSpacing,
		lineHeight: el.style.lineHeight,
		fontSize: el.style.fontSize,
		opacity: cs.opacity,
		transform: cs.transform,
	};
});
check(
	"headline top 120px, Inter 400",
	h1Style.top === "120px" &&
		h1Style.fontWeight === "400" &&
		h1Style.fontFamily.includes("Inter"),
	JSON.stringify(h1Style),
);
check(
	"headline clamp font-size + tracking + leading",
	h1Style.fontSize === "clamp(40px, 5.4vw, 72px)" &&
		h1Style.letterSpacing === "-0.02em" &&
		h1Style.lineHeight === "1.1",
);
check(
	"headline line 1",
	(await h1.locator("span").first().textContent()).trim() ===
		"Venture without edges.",
);
const line2 = h1.locator("span").nth(1);
check(
	"headline line 2 + 55% white",
	(await line2.textContent()).trim() === "Uncover with keen instinct." &&
		(await line2.evaluate((el) => getComputedStyle(el).color)) ===
			"rgba(255, 255, 255, 0.55)",
);
check(
	"headline faded in (opacity 1, translate-y 0)",
	h1Style.opacity === "1" &&
		(h1Style.transform === "none" ||
			h1Style.transform.includes("matrix(1, 0, 0, 1, 0, 0)")),
	`opacity=${h1Style.opacity} transform=${h1Style.transform}`,
);

// --- Bottom block ---
const bottom = page.locator("div.bottom-14");
const bottomClass = await bottom.getAttribute("class");
check(
	"bottom block fixed bottom-14 z-20 col gap-6 delay-300",
	[
		"fixed",
		"bottom-14",
		"z-20",
		"flex-col",
		"items-center",
		"gap-6",
		"delay-300",
	].every((c) => bottomClass.includes(c)),
	bottomClass,
);
const para = bottom.locator("p");
check(
	"paragraph copy (both spans)",
	/Our smart itineraries shape around you — your rhythm, your vibe,\s+your hunger for adventure\.\s+Each getaway is tailored, seamless, and wholly yours\./.test(
		(await para.textContent()).replace(/\s+/g, " "),
	),
	(await para.textContent()).trim().slice(0, 60),
);
check(
	"paragraph max-w/text size",
	(await para.getAttribute("class")).includes("max-w-[620px]") &&
		(await para.getAttribute("class")).includes("text-[15px]"),
);
const btn = bottom.locator("button", { hasText: "Plan my escape today" });
const btnStyle = await btn.evaluate((el) => {
	const cs = getComputedStyle(el);
	return { bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius };
});
check(
	"CTA white bg / black text / pill",
	btnStyle.bg === "rgb(255, 255, 255)" &&
		btnStyle.color === "rgb(0, 0, 0)" &&
		parseFloat(btnStyle.radius) > 20,
	JSON.stringify(btnStyle),
);
const lockSvg = bottom.locator("svg.lucide-lock");
check(
	"Lock icon size 13 / stroke 1.5",
	(await lockSvg.count()) === 1 &&
		(await lockSvg.getAttribute("width")) === "13" &&
		(await lockSvg.getAttribute("stroke-width")) === "1.5",
);
check(
	"secure tagline",
	((await bottom.textContent()) ?? "").includes(
		"SECURE BY DESIGN. ZERO DATA LEAKS.",
	),
);
const bottomOpacity = await bottom.evaluate(
	(el) => getComputedStyle(el).opacity,
);
check(
	"bottom block faded in",
	bottomOpacity === "1",
	`opacity=${bottomOpacity}`,
);

// --- Console errors & screenshots ---
check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ") || "clean",
);
await page.screenshot({ path: "/tmp/wanderful-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.screenshot({ path: "/tmp/wanderful-mobile.png" });
console.log(
	"screenshots: /tmp/wanderful-desktop.png /tmp/wanderful-mobile.png",
);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(
	`\n${results.length - failed.length}/${results.length} checks passed`,
);
process.exit(failed.length ? 1 : 0);
