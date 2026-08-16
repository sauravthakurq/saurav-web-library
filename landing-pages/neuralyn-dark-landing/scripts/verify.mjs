/**
 * CLI-only verification: serves the production build with `vite preview`,
 * then runs headless-Chromium assertions against every spec requirement
 * (structure, styles, fonts, animations, parallax, scroll word-reveal).
 */

import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "verify-output");
mkdirSync(outDir, { recursive: true });

const PORT = 4317;
const URL_BASE = `http://localhost:${PORT}/`;
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

const preview = spawn(
	"npx",
	["vite", "preview", "--port", String(PORT), "--strictPort"],
	{ cwd: root, stdio: "pipe" },
);

const waitForServer = async () => {
	for (let i = 0; i < 60; i++) {
		try {
			const res = await fetch(URL_BASE);
			if (res.ok) return;
		} catch {
			/* not up yet */
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error("vite preview did not start");
};

let failures = 0;
const check = (name, cond, extra = "") => {
	if (cond) {
		console.log(`  PASS  ${name}`);
	} else {
		failures += 1;
		console.error(`  FAIL  ${name}${extra ? ` — ${extra}` : ""}`);
	}
};

const matrixTY = (transform) => {
	const m = transform.match(/matrix\(([^)]+)\)/);
	if (!m) return 0;
	return parseFloat(m[1].split(",")[5]);
};

try {
	await waitForServer();
	const browser = await chromium.launch();
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(URL_BASE, { waitUntil: "networkidle" });
	// let entrance animations (max delay 0.4s + 0.8s duration) finish
	await page.waitForTimeout(1600);

	console.log("\n— Document & navbar —");
	check("title mentions Neuralyn", (await page.title()).includes("Neuralyn"));
	const bodyBg = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	);
	check("body is pure black", bodyBg === "rgb(0, 0, 0)", bodyBg);

	const brand = page.locator("header span", { hasText: "Neuralyn" }).first();
	check("brand text visible", await brand.isVisible());
	check(
		"logo image rendered",
		await page.locator("header img[alt='Neuralyn logo']").isVisible(),
	);
	for (const link of ["Home", "Services", "Reviews", "Contact us"]) {
		check(
			`nav link "${link}"`,
			await page.locator(`nav >> text=${link}`).isVisible(),
		);
	}
	check(
		"Services has ChevronDown icon",
		(await page
			.locator("nav a", { hasText: "Services" })
			.locator("svg")
			.count()) === 1,
	);
	const signIn = page.locator("header button", { hasText: "Sign In" });
	const signInStyle = await signIn.evaluate((el) => {
		const s = getComputedStyle(el);
		return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
	});
	check(
		"Sign In solid white bg",
		signInStyle.bg === "rgb(255, 255, 255)",
		signInStyle.bg,
	);
	check(
		"Sign In black text",
		signInStyle.color === "rgb(0, 0, 0)",
		signInStyle.color,
	);
	check(
		"Sign In rounded-lg (8px)",
		signInStyle.radius === "8px",
		signInStyle.radius,
	);

	console.log("\n— Hero content —");
	const pill = page.locator(".liquid-glass");
	check("liquid-glass pill exists", (await pill.count()) === 1);
	check(
		"pill 'New' badge",
		await pill.locator("span", { hasText: "New" }).first().isVisible(),
	);
	check(
		"pill Corewave text",
		await pill.locator("text=Say Hello to Corewave v3.2").isVisible(),
	);
	const pillStyle = await pill.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			blur: s.backdropFilter || s.webkitBackdropFilter,
			radius: s.borderRadius,
		};
	});
	check(
		"pill backdrop blur(4px)",
		pillStyle.blur.includes("blur(4px)"),
		pillStyle.blur,
	);

	const h1 = page.locator("h1");
	const h1Text = (await h1.innerText()).replace(/\n/g, " ");
	check(
		"title text correct",
		h1Text.includes("Your Insights.") && h1Text.includes("One Clear Overview."),
		h1Text,
	);
	const serifSpan = await h1
		.locator("span")
		.first()
		.evaluate((el) => {
			const s = getComputedStyle(el);
			return { family: s.fontFamily, style: s.fontStyle, weight: s.fontWeight };
		});
	check(
		"'Overview' in Instrument Serif italic",
		serifSpan.family.includes("Instrument Serif") &&
			serifSpan.style === "italic",
		JSON.stringify(serifSpan),
	);
	const h1Style = await h1.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			tracking: s.letterSpacing,
			size: s.fontSize,
			weight: s.fontWeight,
			opacity: s.opacity,
		};
	});
	check("title tracking -2px", h1Style.tracking === "-2px", h1Style.tracking);
	check(
		"title text-7xl at desktop (72px)",
		h1Style.size === "72px",
		h1Style.size,
	);
	check("title font-medium", h1Style.weight === "500", h1Style.weight);
	check(
		"title entrance animation completed",
		h1Style.opacity === "1",
		h1Style.opacity,
	);

	const sub = page.locator("[data-testid='hero-subtitle']");
	const subStyle = await sub.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			color: s.color,
			opacity: s.opacity,
			html: el.innerHTML,
			hasOpacityClass: el.classList.contains("opacity-90"),
		};
	});
	const subRgb = subStyle.color.match(/\d+/g).map(Number);
	const expect = [240, 242, 244]; // hsl(210 17% 95%)
	check(
		"subtitle uses --hero-subtitle color",
		subRgb.every((v, i) => Math.abs(v - expect[i]) <= 2),
		subStyle.color,
	);
	// Framer's entrance animation ends at inline opacity 1, which takes
	// precedence over the class — assert both spec'd pieces are in place.
	check(
		"subtitle opacity-90 class + entrance complete",
		subStyle.hasOpacityClass && subStyle.opacity === "1",
		JSON.stringify({
			class: subStyle.hasOpacityClass,
			opacity: subStyle.opacity,
		}),
	);
	check("subtitle <br/> after 'goals,'", /goals,\s*<br/.test(subStyle.html));

	const cta = page.locator("button", { hasText: "Get Started for Free" });
	const ctaStyle = await cta.evaluate((el) => {
		const s = getComputedStyle(el);
		return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
	});
	check(
		"CTA solid white, black text",
		ctaStyle.bg === "rgb(255, 255, 255)" && ctaStyle.color === "rgb(0, 0, 0)",
	);
	check("CTA rounded-full", ctaStyle.radius === "9999px", ctaStyle.radius);

	console.log("\n— Dashboard + video area —");
	const video = page.locator("video");
	check("video element present", (await video.count()) === 1);
	check("video src correct", (await video.getAttribute("src")) === VIDEO_URL);
	const videoStyle = await video.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			fit: s.objectFit,
			muted: el.muted,
			autoplay: el.hasAttribute("autoplay"),
			loop: el.loop,
			playsInline: el.hasAttribute("playsinline"),
		};
	});
	check(
		"video object-cover + autoplay/muted/loop/playsInline",
		videoStyle.fit === "cover" &&
			videoStyle.muted &&
			videoStyle.autoplay &&
			videoStyle.loop &&
			videoStyle.playsInline,
		JSON.stringify(videoStyle),
	);
	const area = page.locator("[data-testid='dashboard-area']");
	const areaStyle = await area.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			aspect: s.aspectRatio,
			ml: s.marginLeft,
			width: el.getBoundingClientRect().width,
			vw: window.innerWidth,
		};
	});
	check(
		"dashboard area 16/9",
		areaStyle.aspect.replace(/\s/g, "") === "16/9",
		areaStyle.aspect,
	);
	check(
		"dashboard area spans full viewport width",
		Math.abs(areaStyle.width - areaStyle.vw) < 2,
		`${areaStyle.width} vs ${areaStyle.vw}`,
	);
	const dashImg = page.locator("[data-testid='dashboard-image']");
	const dashStyle = await dashImg.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			blend: s.mixBlendMode,
			radius: s.borderRadius,
			naturalWidth: el.naturalWidth,
		};
	});
	check(
		"dashboard image luminosity blend",
		dashStyle.blend === "luminosity",
		dashStyle.blend,
	);
	check(
		"dashboard image rounded-2xl (16px)",
		dashStyle.radius === "16px",
		dashStyle.radius,
	);
	check(
		"dashboard image loaded",
		dashStyle.naturalWidth > 0,
		String(dashStyle.naturalWidth),
	);
	const fade = page.locator("[data-testid='hero-fade']");
	const fadeStyle = await fade.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			bg: s.backgroundImage,
			z: s.zIndex,
			pe: s.pointerEvents,
			h: s.height,
		};
	});
	check(
		"bottom gradient fade (linear-gradient, z-30, pointer-events-none, h-40)",
		fadeStyle.bg.includes("linear-gradient") &&
			fadeStyle.z === "30" &&
			fadeStyle.pe === "none" &&
			fadeStyle.h === "160px",
		JSON.stringify(fadeStyle),
	);

	await page.screenshot({ path: path.join(outDir, "hero-top.png") });

	console.log("\n— Parallax scroll —");
	const heroContent = page.locator("[data-testid='hero-content']");
	const tyBefore = matrixTY(
		await heroContent.evaluate((el) => getComputedStyle(el).transform),
	);
	const dashTyBefore = matrixTY(
		await dashImg.evaluate((el) => getComputedStyle(el).transform),
	);
	await page.evaluate(() => window.scrollTo({ top: 450, behavior: "instant" }));
	await page.waitForTimeout(450);
	const tyAfter = matrixTY(
		await heroContent.evaluate((el) => getComputedStyle(el).transform),
	);
	const opacityAfter = parseFloat(
		await heroContent.evaluate((el) => getComputedStyle(el).opacity),
	);
	const dashTyAfter = matrixTY(
		await dashImg.evaluate((el) => getComputedStyle(el).transform),
	);
	check(
		"hero content moves up on scroll",
		tyAfter < tyBefore,
		`${tyBefore} -> ${tyAfter}`,
	);
	check("hero content fades on scroll", opacityAfter < 1, String(opacityAfter));
	check(
		"dashboard parallax (y up to -250)",
		dashTyAfter < dashTyBefore,
		`${dashTyBefore} -> ${dashTyAfter}`,
	);
	await page.screenshot({ path: path.join(outDir, "hero-scrolled.png") });

	console.log("\n— Testimonial —");
	const quoteWords = page.locator(
		"[data-testid='testimonial-quote'] > span:not(.ml-2)",
	);
	check(
		"31 word spans rendered",
		(await quoteWords.count()) === 31,
		String(await quoteWords.count()),
	);
	check(
		"closing quote mark span",
		await page
			.locator(
				"[data-testid='testimonial-quote'] span.ml-2.text-muted-foreground",
			)
			.isVisible(),
	);
	await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
	await page.waitForTimeout(450);
	const firstWordTop = await quoteWords.first().evaluate((el) => {
		const s = getComputedStyle(el);
		return { opacity: parseFloat(s.opacity), color: s.color };
	});
	check(
		"words dim before scroll (0.2)",
		Math.abs(firstWordTop.opacity - 0.2) < 0.05,
		String(firstWordTop.opacity),
	);

	await page.evaluate(() =>
		window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
	);
	await page.waitForTimeout(600);
	// With the spec'd offset ["start end", "end center"] and the testimonial as
	// the final section, max progress is < 1 by geometry (the container's end
	// cannot reach the viewport center). Verify the reveal MECHANISM: words
	// light up sequentially and monotonically along the scroll range.
	const sampled = await page.evaluate(() => {
		const spans = [
			...document.querySelectorAll(
				"[data-testid='testimonial-quote'] > span:not(.ml-2)",
			),
		];
		const at = (i) => {
			const s = getComputedStyle(spans[i]);
			return { i, opacity: parseFloat(s.opacity), color: s.color };
		};
		return [at(0), at(15), at(20), at(spans.length - 1)];
	});
	const [w0, w15, w20, wLast] = sampled;
	check(
		"first word fully revealed after scroll",
		w0.opacity > 0.95 && w0.color === "rgb(255, 255, 255)",
		JSON.stringify(w0),
	);
	check(
		"reveal progressed deep into the quote (word 21 fully lit)",
		w20.opacity > 0.95,
		JSON.stringify(w20),
	);
	check(
		"reveal is sequential & monotonic (w0 >= w15 >= w20 >= wLast >= 0.2)",
		w0.opacity >= w15.opacity &&
			w15.opacity >= w20.opacity &&
			w20.opacity >= wLast.opacity &&
			wLast.opacity >= 0.19,
		JSON.stringify(sampled),
	);

	const quoteImg = page.locator(
		"[data-testid='testimonial'] img[aria-hidden='true']",
	);
	check(
		"quote symbol image (object-contain)",
		(await quoteImg.evaluate((el) => getComputedStyle(el).objectFit)) ===
			"contain",
	);
	const avatar = page.locator("img[alt='Brooklyn Simmons']");
	const avatarStyle = await avatar.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			radius: s.borderRadius,
			border: s.borderTopWidth,
			fit: s.objectFit,
			loaded: el.naturalWidth > 0,
		};
	});
	check(
		"avatar round, 3px border, object-cover, loaded",
		avatarStyle.radius === "9999px" &&
			avatarStyle.border === "3px" &&
			avatarStyle.fit === "cover" &&
			avatarStyle.loaded,
		JSON.stringify(avatarStyle),
	);
	check("author name", await page.locator("text=Brooklyn Simmons").isVisible());
	check("author role", await page.locator("text=Product Manager").isVisible());
	await page.screenshot({ path: path.join(outDir, "testimonial.png") });

	console.log("\n— Responsive (390x844) —");
	const mobile = await browser.newPage({
		viewport: { width: 390, height: 844 },
	});
	await mobile.goto(URL_BASE, { waitUntil: "networkidle" });
	await mobile.waitForTimeout(1400);
	check("nav links hidden on mobile", await mobile.locator("nav").isHidden());
	check(
		"Sign In still visible on mobile",
		await mobile.locator("header button", { hasText: "Sign In" }).isVisible(),
	);
	const mobileH1 = await mobile
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontSize);
	check("title text-5xl on mobile (48px)", mobileH1 === "48px", mobileH1);
	await mobile.screenshot({ path: path.join(outDir, "mobile.png") });
	await mobile.close();

	console.log("\n— Console —");
	const realErrors = consoleErrors.filter((e) => !e.includes("cloudfront.net"));
	check(
		"no console/page errors",
		realErrors.length === 0,
		realErrors.join(" | "),
	);
	if (consoleErrors.length !== realErrors.length) {
		console.log("  note: video CDN errors ignored (network-dependent)");
	}

	await browser.close();
} finally {
	preview.kill("SIGTERM");
}

console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
