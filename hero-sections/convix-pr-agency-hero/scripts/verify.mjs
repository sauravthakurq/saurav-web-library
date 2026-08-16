/**
 * CLI verification for the Convix Software PR-agency hero.
 * Run: node scripts/verify.mjs (expects `vite preview` serving dist on port 4173)
 */
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:4173";
let failures = 0;

function check(name, condition, detail = "") {
	const ok = Boolean(condition);
	if (!ok) failures += 1;
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	return ok;
}

const browser = await chromium.launch();

// ---------- Desktop (1440x900) ----------
const desktop = await browser.newPage({
	viewport: { width: 1440, height: 900 },
});
const pageErrors = [];
desktop.on("pageerror", (err) => pageErrors.push(err.message));
await desktop.goto(BASE_URL, { waitUntil: "domcontentloaded" });
await desktop.waitForSelector("h1");

check(
	"No uncaught page errors",
	pageErrors.length === 0,
	pageErrors.join("; "),
);

// Page frame
const frame = await desktop.evaluate(() => {
	const main = document.querySelector("main");
	const section = document.querySelector("main > section");
	const ms = getComputedStyle(main);
	const ss = getComputedStyle(section);
	return {
		mainBg: ms.backgroundColor,
		mainFont: ms.fontFamily,
		mainPadding: ms.padding,
		heroBg: ss.backgroundColor,
		heroOverflow: ss.overflow,
		heroRadius: ss.borderRadius,
		heroHeight: section.getBoundingClientRect().height,
	};
});
check(
	"Outer wrapper bg #ededed",
	frame.mainBg === "rgb(237, 237, 237)",
	frame.mainBg,
);
check(
	"Outer wrapper font is Inter",
	frame.mainFont.includes("Inter"),
	frame.mainFont,
);
check(
	"Outer wrapper p-4 at sm+",
	frame.mainPadding === "16px",
	frame.mainPadding,
);
check("Hero bg #d9d9d9", frame.heroBg === "rgb(217, 217, 217)", frame.heroBg);
check(
	"Hero clips content (overflow hidden)",
	frame.heroOverflow === "hidden",
	frame.heroOverflow,
);
check(
	"Hero rounded-3xl at sm+ (24px)",
	frame.heroRadius === "24px",
	frame.heroRadius,
);
check(
	"Hero height = 100vh - 32px",
	Math.round(frame.heroHeight) === 900 - 32,
	String(frame.heroHeight),
);

// Background video
const video = await desktop.evaluate(() => {
	const v = document.querySelector("video");
	if (!v) return null;
	const s = getComputedStyle(v);
	return {
		src: v.getAttribute("src"),
		poster: v.getAttribute("poster"),
		autoplay: v.autoplay,
		loop: v.loop,
		muted: v.muted,
		playsInline: v.playsInline,
		preload: v.getAttribute("preload"),
		disableRemotePlayback: v.hasAttribute("disableremoteplayback"),
		webkitPlaysinline: v.getAttribute("webkit-playsinline"),
		x5Playsinline: v.getAttribute("x5-playsinline"),
		objectFit: s.objectFit,
		pointerEvents: s.pointerEvents,
		position: s.position,
	};
});
check("Video element present", video !== null);
check(
	"Video src is the CloudFront mp4",
	video?.src?.includes("d8j0ntlcm91z4.cloudfront.net"),
	video?.src,
);
check(
	"Video poster is the Unsplash fallback",
	video?.poster?.includes("images.unsplash.com/photo-1557683316"),
);
check(
	"Video autoplay/loop/muted/playsInline",
	video?.autoplay && video?.loop && video?.muted && video?.playsInline,
);
check("Video preload=auto", video?.preload === "auto");
check("Video disableRemotePlayback", video?.disableRemotePlayback);
check('Video webkit-playsinline="true"', video?.webkitPlaysinline === "true");
check('Video x5-playsinline="true"', video?.x5Playsinline === "true");
check(
	"Video object-cover + pointer-events-none + absolute",
	video?.objectFit === "cover" &&
		video?.pointerEvents === "none" &&
		video?.position === "absolute",
);

// Overlay above video
const overlay = await desktop.evaluate(() => {
	const el = document.querySelector('main > section > div[aria-hidden="true"]');
	if (!el) return null;
	const s = getComputedStyle(el);
	return { bg: s.backgroundColor, position: s.position, inset: s.inset };
});
check(
	"White/10 overlay above video",
	overlay?.bg === "rgba(255, 255, 255, 0.1)" &&
		overlay?.position === "absolute",
);

// Fonts actually loaded
const fonts = await desktop.evaluate(async () => {
	await document.fonts.ready;
	return {
		inter: document.fonts.check("16px 'Inter'"),
		instrumentItalic: document.fonts.check("italic 16px 'Instrument Serif'"),
	};
});
check("Inter loaded from Google Fonts", fonts.inter);
check("Instrument Serif italic loaded", fonts.instrumentItalic);

// Navbar (desktop)
for (const link of ["Home", "Features", "About", "Pages"]) {
	check(
		`Nav link "${link}" visible on desktop`,
		await desktop
			.locator(`header nav > div >> a:has-text("${link}")`)
			.first()
			.isVisible(),
	);
}
check(
	"Hamburger hidden on desktop",
	!(await desktop
		.locator('header button[aria-label="Toggle menu"]')
		.isVisible()),
);
check(
	"ShoppingCart visible on desktop",
	await desktop.locator('header button[aria-label="Cart"]').isVisible(),
);
check(
	'"Get early access" label on desktop',
	await desktop
		.locator('header button:has-text("Get early access")')
		.isVisible(),
);
const logo = await desktop.evaluate(() => {
	const svg = document.querySelector('header svg[viewBox="0 0 32 32"]');
	const circles = svg ? [...svg.querySelectorAll("circle")] : [];
	return {
		count: circles.length,
		allOrange: circles.every((c) => c.getAttribute("fill") === "#ef4d23"),
		allR35: circles.every((c) => c.getAttribute("r") === "3.5"),
	};
});
check(
	"Logo = 9 orange circles (8 petals + center), r=3.5",
	logo.count === 9 && logo.allOrange && logo.allR35,
);
const pagesColor = await desktop.evaluate(() => {
	const links = [...document.querySelectorAll("header nav a")];
	const pages = links.find((a) => a.textContent?.trim().startsWith("Pages"));
	return pages ? getComputedStyle(pages).color : null;
});
check(
	'"Pages" link is orange #ef4d23',
	pagesColor === "rgb(239, 77, 35)",
	String(pagesColor),
);

// Hero content
check(
	'Badge "Convix Software" visible',
	await desktop.locator('span:has-text("Convix Software")').first().isVisible(),
);
const headline = await desktop.evaluate(() => {
	const h1 = document.querySelector("h1");
	const span = h1.querySelector("span");
	const hs = getComputedStyle(h1);
	const ss = getComputedStyle(span);
	return {
		text: h1.innerText.replace(/[ \t]+/g, " ").trim(),
		fontSize: hs.fontSize,
		fontWeight: hs.fontWeight,
		letterSpacing: hs.letterSpacing,
		hasBr: h1.querySelector("br") !== null,
		spanText: span.textContent,
		spanStyle: ss.fontStyle,
		spanFamily: ss.fontFamily,
		spanWeight: ss.fontWeight,
	};
});
check(
	'Headline text "Shaping Agencies␤of tomorrow"',
	headline.text === "Shaping Agencies\nof tomorrow",
	JSON.stringify(headline.text),
);
check(
	"Headline clamps to 72px on desktop",
	headline.fontSize === "72px",
	headline.fontSize,
);
check(
	"Headline weight 500 + tracking -0.02em",
	headline.fontWeight === "500" && headline.letterSpacing === "-1.44px",
	`${headline.fontWeight} / ${headline.letterSpacing}`,
);
check('Headline has <br> before "of tomorrow"', headline.hasBr);
check(
	'"Agencies" is Instrument Serif italic 400',
	headline.spanText === "Agencies" &&
		headline.spanStyle === "italic" &&
		headline.spanFamily.includes("Instrument Serif") &&
		headline.spanWeight === "400",
);
const subtitle = desktop.locator(
	'p:has-text("The All-In-One Software Powering the Future of PR Agencies")',
);
check("Subtitle visible", await subtitle.isVisible());
check(
	"Subtitle 16px on desktop",
	(await subtitle.evaluate((el) => getComputedStyle(el).fontSize)) === "16px",
);
const cta = desktop.locator('button:has-text("Get Started")');
check('CTA "Get Started" visible', await cta.isVisible());
check(
	"CTA dark bg #0b0f1a",
	(await cta.evaluate((el) => getComputedStyle(el).backgroundColor)) ===
		"rgb(11, 15, 26)",
);

// Dashboard preview
const tray = await desktop.evaluate(() => {
	const grids = [...document.querySelectorAll("div.grid")];
	const grid = grids[0];
	const tray = grid.parentElement;
	return {
		trayBg: getComputedStyle(tray).backgroundColor,
		trayMaxWidth: getComputedStyle(tray).maxWidth,
		columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
		cards: grid.children.length,
	};
});
check(
	"Tray bg #f5f2ee, max-w 880px",
	tray.trayBg === "rgb(245, 242, 238)" && tray.trayMaxWidth === "880px",
);
check("3 columns on desktop (lg)", tray.columns === 3, String(tray.columns));
check("3 cards in grid", tray.cards === 3);

for (const text of [
	"Clicks",
	"This Month",
	"6,896",
	"-3,382 (33%)",
	"Month Target achieved",
	"389K",
	"425K",
	"Impressions",
]) {
	check(
		`Card 1 contains "${text}"`,
		await desktop
			.locator(`div.grid > div:nth-child(1) >> text=${text}`)
			.first()
			.isVisible(),
	);
}
for (const text of [
	"Show figures for",
	"This month",
	"Compare period by",
	"Month-to-date (MTD)",
	"Ste targets (This month)",
	"Ste targets (This year)",
	"Save",
	"Cancel",
]) {
	check(
		`Card 2 contains "${text}"`,
		await desktop
			.locator(`div.grid > div:nth-child(2) >> text=${text}`)
			.first()
			.isVisible(),
	);
}
const inputs = await desktop.evaluate(() =>
	[...document.querySelectorAll("div.grid input")].map((i) => i.value),
);
check(
	"Card 2 inputs prefilled 10 / 100",
	inputs.length === 2 && inputs[0] === "10" && inputs[1] === "100",
	inputs.join(", "),
);
for (const text of [
	"Video Starts",
	"today",
	"Compared to yesterday",
	"Video Clicks",
]) {
	check(
		`Card 3 contains "${text}"`,
		await desktop
			.locator(`div.grid > div:nth-child(3) >> text=${text}`)
			.first()
			.isVisible(),
	);
}

// Gauges
const gauges = await desktop.evaluate(() => {
	return [...document.querySelectorAll('svg[viewBox="0 0 200 120"]')].map(
		(svg) => {
			const lines = [...svg.querySelectorAll("line")];
			const strokes = lines.map((l) => l.getAttribute("stroke"));
			return {
				ticks: lines.length,
				label: svg.querySelector("text")?.textContent,
				orange: strokes.filter((s) => s === "#ef4d23").length,
				gray: strokes.filter((s) => s === "#9ca3af").length,
				inactive: strokes.filter((s) => s === "#d4d4d8").length,
				caps: lines.every(
					(l) =>
						l.getAttribute("stroke-linecap") === "round" &&
						l.getAttribute("stroke-width") === "2.5",
				),
			};
		},
	);
});
check("Two gauges rendered", gauges.length === 2);
check(
	"Gauge ticks = 40 each",
	gauges.every((g) => g.ticks === 40),
);
check(
	"Gauge 1: 92%, 37 active orange ticks",
	gauges[0]?.label === "92%" &&
		gauges[0]?.orange === 37 &&
		gauges[0]?.inactive === 3,
	JSON.stringify(gauges[0]),
);
check(
	"Gauge 2: 68%, 27 active #9ca3af ticks",
	gauges[1]?.label === "68%" &&
		gauges[1]?.gray === 27 &&
		gauges[1]?.inactive === 13,
	JSON.stringify(gauges[1]),
);
check(
	"Gauge ticks: strokeWidth 2.5, round caps",
	gauges.every((g) => g.caps),
);
const gaugeLabels = await desktop.evaluate(() => {
	const wrappers = [
		...document.querySelectorAll('svg[viewBox="0 0 200 120"]'),
	].map((s) => s.parentElement);
	return wrappers.map((w) => w.querySelectorAll("div span").length);
});
check(
	"Only gauge 1 shows min/max labels",
	gaugeLabels[0] === 2 && gaugeLabels[1] === 0,
	gaugeLabels.join(", "),
);

// Toggle pills: active half is white with shadow
const toggles = await desktop.evaluate(() => {
	const pills = [
		...document.querySelectorAll("div.grid .rounded-full.bg-neutral-100.p-1"),
	];
	return pills.map((p) => {
		const [a, b] = p.querySelectorAll("button");
		return {
			activeBg: getComputedStyle(a).backgroundColor,
			activeShadow: getComputedStyle(a).boxShadow !== "none",
			inactiveBg: getComputedStyle(b).backgroundColor,
		};
	});
});
check(
	"Toggle pills: active = white card + shadow, inactive transparent",
	toggles.length === 2 &&
		toggles.every(
			(t) =>
				t.activeBg === "rgb(255, 255, 255)" &&
				t.activeShadow &&
				t.inactiveBg === "rgba(0, 0, 0, 0)",
		),
);

// Dashboard bleeds off the clipped bottom edge
const bleed = await desktop.evaluate(() => {
	const section = document.querySelector("main > section");
	const grid = document.querySelector("div.grid");
	return (
		grid.getBoundingClientRect().bottom - section.getBoundingClientRect().bottom
	);
});
check(
	"Dashboard cards bleed past hero bottom edge",
	bleed > 0,
	`${Math.round(bleed)}px below the clip line`,
);

// ---------- Tablet (768x1024): md navbar + 2-column grid ----------
const tablet = await browser.newPage({
	viewport: { width: 768, height: 1024 },
});
await tablet.goto(BASE_URL, { waitUntil: "domcontentloaded" });
await tablet.waitForSelector("h1");
const tabletCols = await tablet.evaluate(
	() =>
		getComputedStyle(
			document.querySelector("div.grid"),
		).gridTemplateColumns.split(" ").length,
);
check("2 columns at 768px (sm..lg)", tabletCols === 2, String(tabletCols));
check(
	"Desktop links visible at md (768px)",
	await tablet.locator('header nav a:has-text("Features")').first().isVisible(),
);

// ---------- Mobile (390x844) ----------
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobileErrors = [];
mobile.on("pageerror", (err) => mobileErrors.push(err.message));
await mobile.goto(BASE_URL, { waitUntil: "domcontentloaded" });
await mobile.waitForSelector("h1");

check(
	"No uncaught page errors (mobile)",
	mobileErrors.length === 0,
	mobileErrors.join("; "),
);
const mobileFrame = await mobile.evaluate(() => {
	const section = document.querySelector("main > section");
	const s = getComputedStyle(section);
	return {
		radius: s.borderRadius,
		height: section.getBoundingClientRect().height,
	};
});
check(
	"Hero rounded-2xl on mobile (16px)",
	mobileFrame.radius === "16px",
	mobileFrame.radius,
);
check(
	"Hero height = 100vh - 24px on mobile",
	Math.round(mobileFrame.height) === 844 - 24,
	String(mobileFrame.height),
);
check(
	"Headline clamps down on mobile (36px)",
	(await mobile.evaluate(
		() => getComputedStyle(document.querySelector("h1")).fontSize,
	)) === "36px",
);
check(
	"Desktop links hidden on mobile",
	!(await mobile
		.locator('header nav a:has-text("Features")')
		.first()
		.isVisible()),
);
check(
	"ShoppingCart hidden on mobile",
	!(await mobile.locator('header button[aria-label="Cart"]').isVisible()),
);
check(
	'"Early access" short label on mobile',
	(await mobile
		.locator('header button:has-text("Early access")')
		.first()
		.isVisible()) &&
		!(await mobile
			.locator('header span:text-is("Get early access")')
			.isVisible()),
);
check(
	"1 column on mobile",
	(await mobile.evaluate(
		() =>
			getComputedStyle(
				document.querySelector("div.grid"),
			).gridTemplateColumns.split(" ").length,
	)) === 1,
);

// Hamburger menu interaction
const hamburger = mobile.locator('header button[aria-label="Toggle menu"]');
check("Hamburger visible on mobile", await hamburger.isVisible());
check(
	"Menu closed initially",
	(await mobile.locator("header .shadow-lg").count()) === 0,
);
await hamburger.click();
const panel = mobile.locator("header .shadow-lg");
check("Menu opens on tap", await panel.isVisible());
check("Menu lists all 4 nav items", (await panel.locator("a").count()) === 4);
check(
	"aria-expanded=true when open",
	(await hamburger.getAttribute("aria-expanded")) === "true",
);
await panel.locator('a:has-text("Features")').click();
check(
	"Menu closes after selecting an item",
	(await mobile.locator("header .shadow-lg").count()) === 0,
);

await browser.close();

console.log(
	failures === 0
		? "\nAll checks passed ✅"
		: `\n${failures} check(s) failed ❌`,
);
process.exit(failures === 0 ? 0 : 1);
