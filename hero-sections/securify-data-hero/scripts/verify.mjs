/* Headless verification of the securify hero against a running server.
   Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4723) */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4723";
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};
const near = (a, b, tol = 1.5) => Math.abs(a - b) <= tol;

const browser = await chromium.launch();

/* ---------------- Desktop ---------------- */
{
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	await page.goto(BASE, { waitUntil: "networkidle" });

	/* --- background video --- */
	const video = page.locator("video");
	check("video element present", (await video.count()) === 1);
	check(
		"video src is exact CloudFront URL",
		(await video.getAttribute("src")) === VIDEO_URL,
	);

	const v = await video.evaluate((el) => ({
		autoplay: el.autoplay,
		muted: el.muted,
		loop: el.loop,
		playsInline: el.playsInline,
		objectFit: getComputedStyle(el).objectFit,
		width: el.getBoundingClientRect().width,
		height: el.getBoundingClientRect().height,
	}));
	check("video autoplay", v.autoplay);
	check("video muted", v.muted);
	check("video loop", v.loop);
	check("video playsInline", v.playsInline);
	check("video object-fit: cover", v.objectFit === "cover");
	check(
		"video covers viewport",
		v.width >= 1440 && v.height >= 900,
		`${v.width}x${v.height}`,
	);

	const playing = await video.evaluate(
		(el) =>
			new Promise((resolve) => {
				const deadline = Date.now() + 15000;
				const tick = () => {
					if (el.currentTime > 0.1 && !el.paused) return resolve(true);
					if (Date.now() > deadline) return resolve(false);
					setTimeout(tick, 200);
				};
				tick();
			}),
	);
	check("video is actually playing (looping bg)", playing);

	/* --- global styles --- */
	const globals = await page.evaluate(() => {
		const bodyStyle = getComputedStyle(document.body);
		const root = document.getElementById("root");
		return {
			fontFamily: bodyStyle.fontFamily,
			background: bodyStyle.backgroundColor,
			color: bodyStyle.color,
			smoothing: bodyStyle.webkitFontSmoothing,
			htmlH: document.documentElement.getBoundingClientRect().height,
			bodyH: document.body.getBoundingClientRect().height,
			rootH: root ? root.getBoundingClientRect().height : 0,
			readexLoaded: document.fonts.check('500 1em "Readex Pro"'),
		};
	});
	check(
		"body font-family starts with Readex Pro",
		globals.fontFamily.startsWith('"Readex Pro"') ||
			globals.fontFamily.startsWith("Readex Pro"),
		globals.fontFamily,
	);
	check("Readex Pro font actually loaded", globals.readexLoaded);
	check(
		"body background #000",
		globals.background === "rgb(0, 0, 0)",
		globals.background,
	);
	check(
		"body color #fff",
		globals.color === "rgb(255, 255, 255)",
		globals.color,
	);
	check(
		"body antialiased",
		globals.smoothing === "antialiased",
		globals.smoothing,
	);
	check(
		"html/body/#root full height",
		near(globals.htmlH, 900) &&
			near(globals.bodyH, 900) &&
			near(globals.rootH, 900),
		`${globals.htmlH}/${globals.bodyH}/${globals.rootH}`,
	);

	/* --- navbar --- */
	check(
		'brand "securify" visible',
		await page.getByText("securify", { exact: true }).isVisible(),
	);
	const logo = page.locator("nav svg");
	check(
		"logo svg viewBox 0 0 256 256",
		(await logo.getAttribute("viewBox")) === "0 0 256 256",
	);
	check(
		"logo path filled #ffffff",
		(await logo.locator("path").getAttribute("fill")) === "#ffffff",
	);

	for (const label of ["platform", "solutions", "company", "support"]) {
		check(
			`nav link "${label}" visible on desktop`,
			await page.getByRole("link", { name: label }).isVisible(),
		);
	}
	const pill = await page
		.getByRole("link", { name: "platform" })
		.evaluate((el) => {
			const s = getComputedStyle(el.parentElement);
			return {
				bg: s.backgroundColor,
				blur: s.backdropFilter,
				radius: s.borderRadius,
			};
		});
	check(
		"center pill bg neutral-900/90",
		pill.bg === "rgba(23, 23, 23, 0.9)",
		pill.bg,
	);
	check("center pill backdrop-blur", pill.blur.includes("blur"), pill.blur);
	check("center pill rounded-full", parseFloat(pill.radius) > 100, pill.radius);

	const button = page.getByRole("button", { name: "get started" });
	check('"get started" button visible', await button.isVisible());
	const btn = await button.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			bg: s.backgroundColor,
			color: s.color,
			radius: s.borderRadius,
			transition: s.transitionProperty,
		};
	});
	check(
		"button white bg / black text",
		btn.bg === "rgb(255, 255, 255)" && btn.color === "rgb(0, 0, 0)",
		`${btn.bg} / ${btn.color}`,
	);
	check(
		"button has color transition",
		btn.transition.includes("color"),
		btn.transition,
	);

	/* --- staggered headlines --- */
	const words = ["protect", "your", "data"];
	const boxes = {};
	for (const word of words) {
		const h = page.getByRole("heading", { level: 1, name: word });
		check(`headline "${word}" visible`, await h.isVisible());
		boxes[word] = await h.evaluate((el) => {
			const r = el.getBoundingClientRect();
			const s = getComputedStyle(el);
			return {
				top: r.top,
				left: r.left,
				right: r.right,
				fontSize: parseFloat(s.fontSize),
				letterSpacing: parseFloat(s.letterSpacing),
				lineHeight: parseFloat(s.lineHeight),
				fontWeight: s.fontWeight,
			};
		});
	}
	check(
		"headline size 13vw on desktop",
		near(boxes.protect.fontSize, 1440 * 0.13, 1),
		`${boxes.protect.fontSize}px`,
	);
	check(
		"hero-title letter-spacing -0.04em",
		near(boxes.protect.letterSpacing, boxes.protect.fontSize * -0.04, 0.5),
		`${boxes.protect.letterSpacing}px`,
	);
	check(
		"hero-title line-height 0.95",
		near(boxes.protect.lineHeight, boxes.protect.fontSize * 0.95, 0.5),
		`${boxes.protect.lineHeight}px`,
	);
	check(
		"headline font-medium",
		boxes.protect.fontWeight === "500",
		boxes.protect.fontWeight,
	);
	check(
		"headlines staggered vertically",
		boxes.protect.top < boxes.your.top && boxes.your.top < boxes.data.top,
		`${Math.round(boxes.protect.top)} < ${Math.round(boxes.your.top)} < ${Math.round(boxes.data.top)}`,
	);
	check(
		'"protect" anchored left (md:left-10)',
		near(boxes.protect.left, 40, 2),
		`${boxes.protect.left}px`,
	);
	check(
		'"your" anchored right (md:right-10)',
		near(boxes.your.right, 1440 - 40, 2),
		`${boxes.your.right}px`,
	);
	check(
		'"data" offset left 28% on desktop',
		near(boxes.data.left, 1440 * 0.28, 2),
		`${boxes.data.left}px`,
	);

	/* --- description --- */
	const desc = page.getByText(/we can guarding your data/);
	check("description paragraph visible", await desc.isVisible());
	const d = await desc.evaluate((el) => {
		const r = el.getBoundingClientRect();
		const s = getComputedStyle(el);
		return { width: r.width, fontSize: s.fontSize, color: s.color };
	});
	check("description max-w 240px", d.width <= 240, `${d.width}px`);
	check(
		"description 15px text-white/90",
		d.fontSize === "15px" && d.color === "rgba(255, 255, 255, 0.9)",
		`${d.fontSize} / ${d.color}`,
	);

	/* --- stats + dividers --- */
	for (const [number, sublabel] of [
		["+65k", "startups use"],
		["+1.5b", "gb data was protected"],
		["+300k", "downloads"],
	]) {
		check(
			`stat "${number}" visible`,
			await page.getByText(number, { exact: true }).isVisible(),
		);
		check(
			`sublabel "${sublabel}" visible`,
			await page.getByText(sublabel, { exact: true }).isVisible(),
		);
	}
	const statSize = await page
		.getByText("+65k", { exact: true })
		.evaluate((el) => getComputedStyle(el).fontSize);
	check("stat number text-5xl on desktop", statSize === "48px", statSize);

	const dividers = page.locator("span.h-px.w-24");
	check("three diagonal dividers present", (await dividers.count()) === 3);
	const dividerInfo = await dividers.evaluateAll((els) =>
		els.map((el) => {
			const s = getComputedStyle(el);
			return {
				display: s.display,
				transform: s.transform,
				bg: s.backgroundColor,
			};
		}),
	);
	check(
		"dividers visible on desktop",
		dividerInfo.every((x) => x.display === "block"),
	);
	check(
		"dividers bg-white/40",
		dividerInfo.every((x) => x.bg === "rgba(255, 255, 255, 0.4)"),
	);
	check(
		"dividers rotated (matrix transform)",
		dividerInfo.every((x) => x.transform.startsWith("matrix")),
		dividerInfo[0].transform,
	);

	/* --- gradient overlay --- */
	const gradient = await page.locator(".bg-gradient-to-b").evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			image: s.backgroundImage,
			pointer: s.pointerEvents,
			height: el.getBoundingClientRect().height,
			bottom: el.getBoundingClientRect().bottom,
		};
	});
	check(
		"bottom gradient is linear-gradient to black",
		gradient.image.includes("linear-gradient") &&
			gradient.image.includes("rgb(0, 0, 0)"),
		gradient.image,
	);
	check("gradient pointer-events-none", gradient.pointer === "none");
	check(
		"gradient h-48 pinned to bottom",
		near(gradient.height, 192) && near(gradient.bottom, 900),
		`h=${gradient.height} bottom=${gradient.bottom}`,
	);

	/* --- palette: grayscale only (no purple/indigo anywhere) --- */
	const offPalette = await page.evaluate(() => {
		const bad = [];
		for (const el of document.querySelectorAll("*")) {
			const s = getComputedStyle(el);
			const props = ["color", "backgroundColor"];
			// border color only matters if a border is actually drawn
			if (parseFloat(s.borderTopWidth) > 0) props.push("borderTopColor");
			for (const prop of props) {
				const m = s[prop].match(/rgba?\((\d+), (\d+), (\d+)/);
				if (m && !(m[1] === m[2] && m[2] === m[3]))
					bad.push(`${el.tagName}.${prop}=${s[prop]}`);
			}
		}
		return bad;
	});
	check(
		"palette is pure grayscale (no purple/indigo)",
		offPalette.length === 0,
		offPalette.slice(0, 3).join(", "),
	);

	/* --- all copy lowercase --- */
	const text = await page.evaluate(() => document.body.innerText);
	check("all visible text lowercase", text === text.toLowerCase());

	await page.screenshot({ path: "scripts/screenshots/desktop.png" });
	console.log("saved scripts/screenshots/desktop.png");
	await page.close();
}

/* ---------------- Mobile ---------------- */
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await page.goto(BASE, { waitUntil: "networkidle" });

	check(
		"mobile: brand visible",
		await page.getByText("securify", { exact: true }).isVisible(),
	);
	check(
		'mobile: "get started" visible',
		await page.getByRole("button", { name: "get started" }).isVisible(),
	);
	check(
		"mobile: nav links hidden",
		!(await page.getByRole("link", { name: "platform" }).isVisible()),
	);

	const dividerDisplays = await page
		.locator("span.h-px.w-24")
		.evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
	check(
		"mobile: all diagonal dividers hidden",
		dividerDisplays.every((d) => d === "none"),
		dividerDisplays.join(","),
	);

	const fontSize = await page
		.getByRole("heading", { level: 1, name: "protect" })
		.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
	check(
		"mobile: headline 14vw",
		near(fontSize, 390 * 0.14, 1),
		`${fontSize}px`,
	);

	const vBox = await page
		.locator("video")
		.evaluate((el) => el.getBoundingClientRect());
	check(
		"mobile: video covers viewport",
		vBox.width >= 390 && vBox.height >= 844,
		`${vBox.width}x${vBox.height}`,
	);

	for (const word of ["protect", "your", "data"]) {
		check(
			`mobile: headline "${word}" visible`,
			await page.getByRole("heading", { level: 1, name: word }).isVisible(),
		);
	}

	await page.screenshot({ path: "scripts/screenshots/mobile.png" });
	console.log("saved scripts/screenshots/mobile.png");
	await page.close();
}

await browser.close();

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
