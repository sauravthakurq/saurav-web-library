/**
 * Headless verification for the Orbis.Nft landing page.
 * Expects a server (vite preview) running at BASE_URL (default http://localhost:4173).
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4173";

let failures = 0;
function check(name, ok, detail = "") {
	const status = ok ? "PASS" : "FAIL";
	if (!ok) failures++;
	console.log(`[${status}] ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const pageErrors = [];
page.on("pageerror", (err) => pageErrors.push(err.message));

const res = await page.goto(BASE_URL, { waitUntil: "networkidle" });
check(
	"Page loads (HTTP 200)",
	res?.status() === 200,
	`status=${res?.status()}`,
);

// --- Fonts ---
const fontHref = await page.$eval(
	'link[href*="fonts.googleapis.com/css2"]',
	(el) => el.getAttribute("href"),
);
check(
	"Google Fonts link loads Anton + Condiment",
	fontHref ===
		"https://fonts.googleapis.com/css2?family=Anton&family=Condiment&display=swap",
	String(fontHref),
);

// --- Videos ---
const videos = await page.$$eval("video", (els) =>
	els.map((v) => ({
		src: v.getAttribute("src"),
		autoplay: v.hasAttribute("autoplay"),
		loop: v.hasAttribute("loop"),
		muted: v.muted,
		playsInline: v.hasAttribute("playsinline"),
		objectFit: getComputedStyle(v).objectFit,
	})),
);
check(
	"6 videos on the page (hero, about, 3 cards, cta)",
	videos.length === 6,
	`found=${videos.length}`,
);
check(
	"All videos have autoplay/loop/muted/playsinline",
	videos.every((v) => v.autoplay && v.loop && v.muted && v.playsInline),
);
check(
	"First 5 videos use object-cover; CTA video does not",
	videos.slice(0, 5).every((v) => v.objectFit === "cover") &&
		videos[5].objectFit !== "cover",
	videos.map((v) => v.objectFit).join(","),
);
const EXPECTED_IDS = [
	"045634",
	"151551",
	"053923",
	"054411",
	"055427",
	"055729",
];
check(
	"Video URLs are the 6 specified CloudFront files, in order",
	EXPECTED_IDS.every((id, i) => videos[i]?.src?.includes(`hf_20260331_${id}`)),
);

// --- Navigation ---
const navLinks = await page.$$eval("nav a", (els) =>
	els.map((a) => a.textContent?.trim()),
);
check(
	"Nav has the 5 links",
	JSON.stringify(navLinks) ===
		JSON.stringify(["Homepage", "Gallery", "Buy NFT", "FAQ", "Contact"]),
	navLinks.join(", "),
);
check("Nav visible on desktop", await page.isVisible("nav"));

// --- Hero ---
const h1 = await page.textContent("h1");
check(
	"Hero heading text",
	/Beyond earth\s*and \( its \) familiar boundaries/.test(h1 ?? ""),
	JSON.stringify(h1),
);
const h1Style = await page.$eval("h1", (el) => {
	const s = getComputedStyle(el);
	return { transform: s.textTransform, font: s.fontFamily, size: s.fontSize };
});
check(
	"Hero heading is uppercase Anton 90px at 1440px",
	h1Style.transform === "uppercase" &&
		h1Style.font.includes("Anton") &&
		h1Style.size === "90px",
	JSON.stringify(h1Style),
);

// --- Condiment neon accents ---
// Per spec, "Space" (section 3) is neon Condiment only; the other three also use mix-blend-exclusion.
for (const { text, blend } of [
	{ text: "Nft collection", blend: "exclusion" },
	{ text: "Orbis", blend: "exclusion" },
	{ text: "Space", blend: "normal" },
	{ text: "Go beyond", blend: "exclusion" },
]) {
	const info = await page.evaluate((t) => {
		const span = [...document.querySelectorAll("span")].find(
			(el) =>
				el.textContent?.trim() === t &&
				getComputedStyle(el).fontFamily.includes("Condiment"),
		);
		if (!span) return null;
		const s = getComputedStyle(span);
		return {
			color: s.color,
			blend: s.mixBlendMode,
			transform: s.textTransform,
		};
	}, text);
	check(
		`Condiment accent "${text}" is neon green + ${blend} blend + normal-case`,
		info !== null &&
			info.color === "rgb(111, 255, 0)" &&
			info.blend === blend &&
			info.transform !== "uppercase",
		JSON.stringify(info),
	);
}

// --- Liquid glass ---
const glass = await page.$$eval(".liquid-glass", (els) =>
	els.map((el) => {
		const s = getComputedStyle(el);
		return {
			blur: s.backdropFilter || s.webkitBackdropFilter,
			overflow: s.overflow,
			position: s.position,
		};
	}),
);
check(
	"Liquid glass applied to 13+ elements",
	glass.length >= 13,
	`count=${glass.length}`,
);
// Some glass elements are intentionally absolutely positioned (nav, card
// overlay bars, CTA social container), so assert non-static rather than relative.
check(
	"Liquid glass has blur(4px) + positioned + overflow hidden",
	glass.every(
		(g) =>
			g.blur.includes("blur(4px)") &&
			g.position !== "static" &&
			g.overflow === "hidden",
	),
);

// --- Collection ---
const scores = await page.$$eval("article", (cards) =>
	cards.map((c) => c.textContent ?? ""),
);
check("3 NFT cards", scores.length === 3, `count=${scores.length}`);
check(
	"Rarity scores 8.7/10, 9/10, 8.2/10",
	["8.7/10", "9/10", "8.2/10"].every(
		(s, i) =>
			scores[i]?.includes(s) &&
			scores[i]?.toLowerCase().includes("rarity score:"),
	),
);
const gridCols = await page.$eval(
	"article",
	(card) =>
		getComputedStyle(card.parentElement).gridTemplateColumns.split(" ").length,
);
check("Grid is 3 columns on desktop", gridCols === 3, `cols=${gridCols}`);
const arrowBtn = await page.$eval("article button", (b) => {
	const s = getComputedStyle(b);
	return {
		w: s.width,
		h: s.height,
		radius: s.borderRadius,
		bg: s.backgroundImage,
		svg: !!b.querySelector("svg"),
	};
});
check(
	"Card arrow button is 48px circular purple gradient with SVG chevron",
	arrowBtn.w === "48px" &&
		arrowBtn.h === "48px" &&
		arrowBtn.bg.includes("linear-gradient") &&
		arrowBtn.svg,
	JSON.stringify(arrowBtn),
);

// --- See all creators ---
const body = await page.textContent("body");
check(
	"SEE ALL CREATORS button text present",
	/See/.test(body) && /All/.test(body) && /Creators/.test(body),
);
const neonBar = await page.evaluate(() => {
	const bars = [...document.querySelectorAll("span")].filter(
		(el) =>
			getComputedStyle(el).backgroundColor === "rgb(111, 255, 0)" &&
			el.textContent === "",
	);
	return bars.length > 0 ? getComputedStyle(bars[0]).height : null;
});
check(
	"Neon underline bar under SEE ALL CREATORS (10px at lg)",
	neonBar === "10px",
	String(neonBar),
);

// --- CTA ---
check(
	"CTA heading lines present",
	[
		"Join us.",
		"Reveal what’s hidden.",
		"Define what’s next.",
		"Follow the signal.",
	].every((l) => body.includes(l)),
);

// --- Texture overlay ---
const overlay = await page.$eval(".texture-overlay", (el) => {
	const s = getComputedStyle(el);
	return {
		position: s.position,
		z: s.zIndex,
		pointer: s.pointerEvents,
		blend: s.mixBlendMode,
		opacity: s.opacity,
		size: s.backgroundSize,
		image: s.backgroundImage,
	};
});
check(
	"Texture overlay: fixed, z-50, no pointer events, lighten @ 0.6, cover, texture.png",
	overlay.position === "fixed" &&
		overlay.z === "50" &&
		overlay.pointer === "none" &&
		overlay.blend === "lighten" &&
		overlay.opacity === "0.6" &&
		overlay.size === "cover" &&
		overlay.image.includes("texture.png"),
	JSON.stringify(overlay),
);
const texRes = await page.request.get(`${BASE_URL}/texture.png`);
check(
	"texture.png served (HTTP 200, PNG)",
	texRes.status() === 200 &&
		(await texRes.body()).subarray(1, 4).toString() === "PNG",
);

// --- Page background ---
const bg = await page.$eval(
	"body",
	(el) => getComputedStyle(el).backgroundColor,
);
check("Body background is #010828", bg === "rgb(1, 8, 40)", bg);

await page.screenshot({ path: "/tmp/orbis-desktop.png", fullPage: true });

// --- Mobile checks ---
await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(300);
check("Nav hidden on mobile", !(await page.isVisible("nav")));
const mobileCols = await page.$eval(
	"article",
	(card) =>
		getComputedStyle(card.parentElement).gridTemplateColumns.split(" ").length,
);
check("Grid is 1 column on mobile", mobileCols === 1, `cols=${mobileCols}`);
const mobileH1 = await page.$eval("h1", (el) => getComputedStyle(el).fontSize);
check("Hero heading 40px on mobile", mobileH1 === "40px", mobileH1);
const heroSocialVisible = await page.$$eval(
	"header ~ div a[aria-label]",
	(els) => els.filter((el) => el.checkVisibility()).length,
);
check(
	"Mobile hero social icons visible (3, centered row)",
	heroSocialVisible === 3,
	`visible=${heroSocialVisible}`,
);
await page.screenshot({ path: "/tmp/orbis-mobile.png", fullPage: true });

// --- Tablet grid ---
await page.setViewportSize({ width: 800, height: 1000 });
await page.waitForTimeout(300);
const tabletCols = await page.$eval(
	"article",
	(card) =>
		getComputedStyle(card.parentElement).gridTemplateColumns.split(" ").length,
);
check("Grid is 2 columns on tablet", tabletCols === 2, `cols=${tabletCols}`);

check("No JS page errors", pageErrors.length === 0, pageErrors.join("; "));

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
