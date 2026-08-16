/**
 * CLI verification for transform-data-hero.
 *
 * Serves the production build, drives headless Chromium via Playwright and
 * asserts every requirement from PROMPT.txt: typography, layout, colors,
 * component content, and the custom requestAnimationFrame video fade system
 * (fade-in on load, fade-out near the end, reset + fade back in on ended).
 */

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = 4173;

const MIME = {
	".html": "text/html",
	".js": "text/javascript",
	".css": "text/css",
	".svg": "image/svg+xml",
	".png": "image/png",
};

const server = createServer(async (req, res) => {
	try {
		const urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
		const rel = urlPath === "/" ? "index.html" : urlPath.slice(1);
		const file = normalize(join(DIST, rel));
		if (!file.startsWith(DIST)) throw new Error("forbidden");
		const body = await readFile(file);
		res.writeHead(200, {
			"Content-Type": MIME[extname(file)] ?? "application/octet-stream",
		});
		res.end(body);
	} catch {
		res.writeHead(404);
		res.end("not found");
	}
});
await new Promise((resolve) => server.listen(PORT, resolve));

let failures = 0;
const check = (label, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};

const launch = async (channel) =>
	chromium.launch({
		...(channel ? { channel } : {}),
		args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"],
	});

let browser = await launch();
let page;

const openPage = async () => {
	const ctx = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const p = await ctx.newPage();
	p.on("pageerror", (err) => {
		check("no uncaught page errors", false, String(err));
	});
	await p.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
	await p.waitForSelector("h1");
	return p;
};

page = await openPage();

// If this Chromium build cannot decode the mp4, retry with system Chrome.
const videoPlayable = await page
	.waitForFunction(
		() => {
			const v = document.querySelector('[data-testid="bg-video"]');
			return v && (v.readyState >= 2 || v.error !== null);
		},
		{ timeout: 30_000 },
	)
	.then(() => page.$eval('[data-testid="bg-video"]', (v) => v.error === null))
	.catch(() => false);

if (!videoPlayable) {
	console.log(
		"INFO  bundled Chromium cannot decode the mp4 — retrying with system Chrome",
	);
	await browser.close();
	browser = await launch("chrome");
	page = await openPage();
}

/* ---------------- typography & navigation ---------------- */

const h1 = await page.$eval("h1", (el) => {
	const s = getComputedStyle(el);
	return {
		text: el.textContent,
		fontSize: s.fontSize,
		fontFamily: s.fontFamily,
		fontWeight: s.fontWeight,
		letterSpacing: s.letterSpacing,
		lineHeight: s.lineHeight,
		textAlign: s.textAlign,
		color: s.color,
	};
});
check("headline text", h1.text === "Transform Data Quickly", h1.text);
check(
	"headline 80px Fustat Bold",
	h1.fontSize === "80px" &&
		/Fustat/.test(h1.fontFamily) &&
		h1.fontWeight === "700",
	`${h1.fontSize} / ${h1.fontFamily} / ${h1.fontWeight}`,
);
check(
	"headline -4.8px tracking",
	h1.letterSpacing === "-4.8px",
	h1.letterSpacing,
);
check("headline leading-none", h1.lineHeight === "80px", h1.lineHeight);
check(
	"headline centered black",
	h1.textAlign === "center" && h1.color === "rgb(0, 0, 0)",
	`${h1.textAlign} / ${h1.color}`,
);

const logo = await page.$eval("nav a", (el) => {
	const s = getComputedStyle(el);
	return {
		text: el.textContent,
		fontSize: s.fontSize,
		fontWeight: s.fontWeight,
		letterSpacing: s.letterSpacing,
		fontFamily: s.fontFamily,
	};
});
check(
	"logo Logoipsum 24px SemiBold -1.44px Schibsted",
	logo.text === "Logoipsum" &&
		logo.fontSize === "24px" &&
		logo.fontWeight === "600" &&
		logo.letterSpacing === "-1.44px" &&
		/Schibsted Grotesk/.test(logo.fontFamily),
	JSON.stringify(logo),
);

const menu = await page.$$eval("nav ul a", (els) =>
	els.map((el) => ({
		label: el.textContent.trim(),
		fontSize: getComputedStyle(el).fontSize,
		letterSpacing: getComputedStyle(el).letterSpacing,
		weight: getComputedStyle(el).fontWeight,
		hasChevron: el.querySelector("svg") !== null,
	})),
);
check(
	"5 menu items in order",
	menu.map((m) => m.label).join(",") ===
		"Platform,Features,Projects,Community,Contact",
	menu.map((m) => m.label).join(","),
);
check(
	"menu 16px Medium -0.2px",
	menu.every(
		(m) =>
			m.fontSize === "16px" &&
			m.weight === "500" &&
			m.letterSpacing === "-0.2px",
	),
);
check(
	"Features has chevron icon",
	menu.find((m) => m.label === "Features")?.hasChevron === true,
);

const navButtons = await page.$$eval("nav > div > button", (els) =>
	els.map((el) => {
		const s = getComputedStyle(el);
		return {
			label: el.textContent.trim(),
			width: el.getBoundingClientRect().width,
			bg: s.backgroundColor,
			color: s.color,
		};
	}),
);
const signUp = navButtons.find((b) => b.label === "Sign Up");
const logIn = navButtons.find((b) => b.label === "Log In");
check(
	"Sign Up 82px transparent",
	signUp && Math.round(signUp.width) === 82 && signUp.bg === "rgba(0, 0, 0, 0)",
	JSON.stringify(signUp),
);
check(
	"Log In 101px black/white",
	logIn &&
		Math.round(logIn.width) === 101 &&
		logIn.bg === "rgb(0, 0, 0)" &&
		logIn.color === "rgb(255, 255, 255)",
	JSON.stringify(logIn),
);

const navPad = await page.$eval("nav", (el) => {
	const s = getComputedStyle(el);
	return `${s.paddingLeft}/${s.paddingRight}/${s.paddingTop}/${s.paddingBottom}`;
});
check(
	"nav padding 120px x / 16px y",
	navPad === "120px/120px/16px/16px",
	navPad,
);

/* ---------------- badge + subtitle ---------------- */

const badgeText = await page.$eval("header > div", (el) => el.textContent);
check(
	"badge content",
	badgeText.includes("New") && badgeText.includes("Discover what’s possible"),
	badgeText,
);
const badge = await page.$eval("header > div", (el) => {
	const s = getComputedStyle(el);
	const dark = el.querySelector("span");
	return {
		fontSize: s.fontSize,
		fontFamily: s.fontFamily,
		weight: s.fontWeight,
		shadow: s.boxShadow !== "none",
		rounded: parseFloat(s.borderRadius) > 0,
		darkBg: getComputedStyle(dark).backgroundColor,
		hasStar: dark.querySelector("svg") !== null,
	};
});
check(
	"badge Inter Regular 14px",
	badge.fontSize === "14px" &&
		/Inter/.test(badge.fontFamily) &&
		badge.weight === "400",
	JSON.stringify(badge),
);
check("badge rounded + shadow", badge.rounded && badge.shadow);
check(
	"dark badge #0e1311 with star",
	badge.darkBg === "rgb(14, 19, 17)" && badge.hasStar,
	badge.darkBg,
);

const subtitle = await page.$eval("header p", (el) => {
	const s = getComputedStyle(el);
	return {
		fontSize: s.fontSize,
		weight: s.fontWeight,
		letterSpacing: s.letterSpacing,
		color: s.color,
		width: el.getBoundingClientRect().width,
		maxWidth: s.maxWidth,
		fontFamily: s.fontFamily,
	};
});
check(
	"subtitle Fustat Medium 20px -0.4px #505050",
	subtitle.fontSize === "20px" &&
		subtitle.weight === "500" &&
		subtitle.letterSpacing === "-0.4px" &&
		subtitle.color === "rgb(80, 80, 80)" &&
		/Fustat/.test(subtitle.fontFamily),
	JSON.stringify(subtitle),
);
check(
	"subtitle width 542 / max 736",
	Math.round(subtitle.width) === 542 && subtitle.maxWidth === "736px",
	`${subtitle.width} / ${subtitle.maxWidth}`,
);

/* ---------------- search box ---------------- */

const box = await page.$eval("section", (el) => {
	const s = getComputedStyle(el);
	const r = el.getBoundingClientRect();
	return {
		width: r.width,
		height: r.height,
		maxWidth: s.maxWidth,
		radius: s.borderRadius,
		bg: s.backgroundColor,
		blur: s.backdropFilter,
	};
});
check(
	"search box 728x200 rounded 18",
	Math.round(box.width) === 728 &&
		Math.round(box.height) === 200 &&
		box.maxWidth === "728px" &&
		box.radius === "18px",
	JSON.stringify(box),
);
check(
	"search box rgba(0,0,0,0.24) + backdrop blur",
	box.bg === "rgba(0, 0, 0, 0.24)" && /blur/.test(box.blur),
	`${box.bg} / ${box.blur}`,
);

const topRow = await page.$eval("section > div:first-child", (el) => {
	const s = getComputedStyle(el);
	const upgrade = [...el.querySelectorAll("button")].find(
		(b) => b.textContent.trim() === "Upgrade",
	);
	return {
		text: el.textContent,
		fontSize: s.fontSize,
		color: s.color,
		weight: s.fontWeight,
		fontFamily: s.fontFamily,
		upgradeBg: upgrade ? getComputedStyle(upgrade).backgroundColor : null,
		hasSparkle: el.querySelector("svg") !== null,
	};
});
check(
	"credits + GPT-4o row",
	topRow.text.includes("60/450 credits") &&
		topRow.text.includes("Powered by GPT-4o"),
	topRow.text,
);
check(
	"top row Schibsted Medium 12px white",
	topRow.fontSize === "12px" &&
		topRow.weight === "500" &&
		topRow.color === "rgb(255, 255, 255)" &&
		/Schibsted Grotesk/.test(topRow.fontFamily),
);
check(
	"green Upgrade rgba(90,225,76,0.89)",
	topRow.upgradeBg === "rgba(90, 225, 76, 0.89)",
	topRow.upgradeBg,
);
check("AI sparkle icon present", topRow.hasSparkle);

const input = await page.$eval("section input", (el) => {
	const s = getComputedStyle(el);
	return { placeholder: el.placeholder, fontSize: s.fontSize };
});
check(
	'input placeholder "Type question..." 16px',
	input.placeholder === "Type question..." && input.fontSize === "16px",
	JSON.stringify(input),
);

const inputCard = await page.$eval(
	"section > div.bg-white, section > div:nth-child(2)",
	(el) => {
		const s = getComputedStyle(el);
		return {
			bg: s.backgroundColor,
			radius: s.borderRadius,
			shadow: s.boxShadow !== "none",
		};
	},
);
check(
	"white input card rounded 12 + shadow",
	inputCard.bg === "rgb(255, 255, 255)" &&
		inputCard.radius === "12px" &&
		inputCard.shadow,
	JSON.stringify(inputCard),
);

const submit = await page.$eval(
	'section button[aria-label="Submit question"]',
	(el) => {
		const s = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		return {
			w: r.width,
			h: r.height,
			bg: s.backgroundColor,
			radius: s.borderRadius,
			hasArrow: el.querySelector("svg") !== null,
		};
	},
);
check(
	"36px black circular submit with arrow",
	Math.round(submit.w) === 36 &&
		Math.round(submit.h) === 36 &&
		submit.bg === "rgb(0, 0, 0)" &&
		submit.hasArrow,
	JSON.stringify(submit),
);

const actions = await page.$$eval("section .mt-auto button", (els) =>
	els.map((el) => {
		const s = getComputedStyle(el);
		return {
			label: el.textContent.trim(),
			bg: s.backgroundColor,
			radius: s.borderRadius,
			hasIcon: el.querySelector("svg") !== null,
		};
	}),
);
check(
	"Attach/Voice/Prompts buttons",
	actions.map((a) => a.label).join(",") === "Attach,Voice,Prompts" &&
		actions.every((a) => a.hasIcon),
	actions.map((a) => a.label).join(","),
);
check(
	"action buttons #f8f8f8 rounded 6",
	actions.every((a) => a.bg === "rgb(248, 248, 248)" && a.radius === "6px"),
);

const counter0 = await page.$eval(
	'[data-testid="char-counter"]',
	(el) => el.textContent,
);
check('counter starts "0/3,000"', counter0 === "0/3,000", counter0);
await page.fill("section input", "Hello");
const counter5 = await page.$eval(
	'[data-testid="char-counter"]',
	(el) => el.textContent,
);
check('counter live updates to "5/3,000"', counter5 === "5/3,000", counter5);
await page.fill("section input", "");

/* ---------------- spacing ---------------- */

const spacing = await page.evaluate(() => {
	const main = document.querySelector("main");
	const header = document.querySelector("header");
	const badge = header.children[0];
	const h1 = header.children[1];
	const p = header.children[2];
	const sectionEl = document.querySelector("section");
	const inner = main.firstElementChild;
	return {
		mainMarginTop: getComputedStyle(main).marginTop,
		innerMarginTop: getComputedStyle(inner).marginTop,
		badgeToTitle: Math.round(
			h1.getBoundingClientRect().top - badge.getBoundingClientRect().bottom,
		),
		titleToSubtitle: Math.round(
			p.getBoundingClientRect().top - h1.getBoundingClientRect().bottom,
		),
		headerToSearch: Math.round(
			sectionEl.getBoundingClientRect().top -
				header.getBoundingClientRect().bottom,
		),
		mainPadX: getComputedStyle(main).paddingLeft,
	};
});
check(
	"nav→hero gap 60px",
	spacing.mainMarginTop === "60px",
	spacing.mainMarginTop,
);
check(
	"hero content -50px margin",
	spacing.innerMarginTop === "-50px",
	spacing.innerMarginTop,
);
check(
	"badge→title 34px",
	spacing.badgeToTitle === 34,
	String(spacing.badgeToTitle),
);
check(
	"title→subtitle 34px",
	spacing.titleToSubtitle === 34,
	String(spacing.titleToSubtitle),
);
check(
	"header→search 44px",
	spacing.headerToSearch === 44,
	String(spacing.headerToSearch),
);
check(
	"hero horizontal padding 120px",
	spacing.mainPadX === "120px",
	spacing.mainPadX,
);

/* ---------------- fonts ---------------- */

const fonts = await page.evaluate(async () => {
	const families = ["Schibsted Grotesk", "Inter", "Noto Sans", "Fustat"];
	const weights = [400, 500, 600, 700];
	const results = [];
	for (const family of families) {
		await Promise.all(
			weights.map((w) => document.fonts.load(`${w} 16px "${family}"`)),
		);
		results.push({
			family,
			loaded: weights.every((w) =>
				document.fonts.check(`${w} 16px "${family}"`),
			),
		});
	}
	return results;
});
for (const f of fonts) check(`font loaded (400–700): ${f.family}`, f.loaded);

/* ---------------- video + fade system ---------------- */

const videoStatic = await page.$eval('[data-testid="bg-video"]', (v) => {
	const s = getComputedStyle(v);
	const wrapper = v.parentElement.getBoundingClientRect();
	const r = v.getBoundingClientRect();
	return {
		src: v.currentSrc || v.src,
		muted: v.muted,
		widthRatio: r.width / wrapper.width,
		heightRatio: r.height / wrapper.height,
		centeredX:
			Math.abs(r.left + r.width / 2 - (wrapper.left + wrapper.width / 2)) < 1,
		top: r.top - wrapper.top,
		objectFit: s.objectFit,
		objectPosition: s.objectPosition,
		transition: s.transitionDuration,
		error: v.error ? v.error.code : null,
	};
});
check(
	"video src is the cloudfront mp4",
	/d8j0ntlcm91z4\.cloudfront\.net.*\.mp4$/.test(videoStatic.src),
	videoStatic.src,
);
check(
	"video 115% size",
	Math.abs(videoStatic.widthRatio - 1.15) < 0.01 &&
		Math.abs(videoStatic.heightRatio - 1.15) < 0.01,
	`${videoStatic.widthRatio.toFixed(3)} / ${videoStatic.heightRatio.toFixed(3)}`,
);
check(
	"video centered, anchored top, object-top",
	videoStatic.centeredX &&
		videoStatic.top === 0 &&
		videoStatic.objectFit === "cover" &&
		videoStatic.objectPosition === "50% 0%",
	`${videoStatic.centeredX} / ${videoStatic.top} / ${videoStatic.objectPosition}`,
);
check(
	"NO CSS transition on video",
	videoStatic.transition === "0s",
	videoStatic.transition,
);

if (videoStatic.error !== null) {
	check("video decodes & plays", false, `MediaError code ${videoStatic.error}`);
} else {
	// 1) fade-in on load reaches full opacity
	const fadedIn = await page
		.waitForFunction(
			() => {
				const v = document.querySelector('[data-testid="bg-video"]');
				return !v.paused && parseFloat(v.style.opacity) > 0.95;
			},
			{ timeout: 30_000 },
		)
		.then(() => true)
		.catch(() => false);
	check("fade-in: video playing at opacity ~1", fadedIn);

	if (fadedIn) {
		// 2) seek near the end → timeupdate triggers the 250ms fade-out
		await page.$eval('[data-testid="bg-video"]', (v) => {
			v.currentTime = Math.max(0, v.duration - 0.45);
		});
		const fadedOut = await page
			.waitForFunction(
				() => {
					const v = document.querySelector('[data-testid="bg-video"]');
					return parseFloat(v.style.opacity) < 0.6;
				},
				{ timeout: 5_000 },
			)
			.then(() => true)
			.catch(() => false);
		check("fade-out triggers when <0.55s remain", fadedOut);

		// 3) ended → 100ms delay → reset to 0, play, fade back in
		const looped = await page
			.waitForFunction(
				() => {
					const v = document.querySelector('[data-testid="bg-video"]');
					return (
						v.currentTime < 2 && !v.paused && parseFloat(v.style.opacity) > 0.9
					);
				},
				{ timeout: 10_000 },
			)
			.then(() => true)
			.catch(() => false);
		check("loop restart: reset to 0, playing, faded back in", looped);
	}
}

await page.screenshot({
	path: fileURLToPath(new URL("./screenshot.png", import.meta.url)),
	fullPage: false,
});
console.log("INFO  screenshot saved to scripts/screenshot.png");

await browser.close();
server.close();

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
