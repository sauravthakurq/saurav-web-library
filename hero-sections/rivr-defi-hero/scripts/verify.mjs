/* Headless verification of the RIVR hero against a running server.
   Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4173) */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4173";
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};

const browser = await chromium.launch();

/* Tailwind v4 computes `bg-white/N` via color-mix in oklab, so the computed
   backgroundColor is e.g. `oklab(0.999994 ... / 0.6)` rather than rgba(). */
const isWhiteAtAlpha = (bg, alpha) => {
	const rgba = bg === `rgba(255, 255, 255, ${alpha})`;
	const oklab = /^oklab\(0\.99\d*/.test(bg) && bg.endsWith(`/ ${alpha})`);
	return rgba || oklab;
};

/* ---------------- Desktop (1440x900) ---------------- */
{
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	const errors = [];
	page.on("pageerror", (e) => errors.push(e.message));
	await page.goto(BASE, { waitUntil: "networkidle" });

	// Video background
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
	}));
	check(
		"video autoplay/muted/loop/playsInline",
		v.autoplay && v.muted && v.loop && v.playsInline,
	);
	check("video object-fit: cover", v.objectFit === "cover");

	// Headline + subtext
	const h1 = page.locator("h1");
	check(
		'h1 text "Fluid Asset Streams"',
		(await h1.textContent())?.trim() === "Fluid Asset Streams",
	);
	const h1Style = await h1.evaluate((el) => ({
		fontSize: getComputedStyle(el).fontSize,
		color: getComputedStyle(el).color,
		fontFamily: getComputedStyle(el).fontFamily,
	}));
	check("h1 80px at lg", h1Style.fontSize === "80px", h1Style.fontSize);
	check(
		"h1 color #5E6470",
		h1Style.color === "rgb(94, 100, 112)",
		h1Style.color,
	);
	check(
		"Helvetica Regular font applied",
		h1Style.fontFamily.includes("Helvetica Regular"),
		h1Style.fontFamily,
	);
	check(
		"subtext present",
		(await page
			.getByText("Access Smart Vaults, stake RIVR", { exact: false })
			.count()) === 1,
	);

	// Badge
	const badge = page.locator("span", { hasText: "Fluid Staking" }).first();
	check('HeroBadge "Fluid Staking" visible', await badge.isVisible());
	const badgeWrap = page
		.locator("div.backdrop-blur-md", { hasText: "Fluid Staking" })
		.first();
	const badgeStyle = await badgeWrap.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			bf: s.backdropFilter || s.webkitBackdropFilter || "",
			bg: s.backgroundColor,
		};
	});
	check(
		"badge has glassmorphism (backdrop-blur + bg-white/60)",
		badgeStyle.bf.includes("blur(12px)") &&
			isWhiteAtAlpha(badgeStyle.bg, "0.6"),
		`${badgeStyle.bf} | ${badgeStyle.bg}`,
	);

	// Navbar
	for (const item of ["Ecosystem", "Economics", "Developers", "Governance"]) {
		check(
			`nav item "${item}" visible`,
			await page.locator("nav li", { hasText: item }).isVisible(),
		);
	}
	check(
		"dropdown chevrons on Economics + Governance only",
		(await page.locator('nav li:has-text("Economics") svg').count()) === 1 &&
			(await page.locator('nav li:has-text("Governance") svg').count()) === 1 &&
			(await page.locator('nav li:has-text("Ecosystem") svg').count()) === 0 &&
			(await page.locator('nav li:has-text("Developers") svg').count()) === 0,
	);
	check(
		"Book Demo button visible",
		await page.locator("button", { hasText: "Book Demo" }).isVisible(),
	);
	check(
		"mobile RIVR logo hidden on desktop",
		!(await page.locator("span", { hasText: /^RIVR$/ }).isVisible()),
	);

	// Bottom-left card
	check("5.2K stat visible", await page.getByText("5.2K").isVisible());
	check(
		"Active Yielders label visible",
		await page.getByText("Active Yielders").isVisible(),
	);
	check(
		"Join Discord button visible",
		await page.locator("button", { hasText: "Join Discord" }).isVisible(),
	);
	const card = page
		.locator("div.backdrop-blur-xl", { hasText: "Active Yielders" })
		.first();
	const cardStyle = await card.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			bf: s.backdropFilter || s.webkitBackdropFilter || "",
			bg: s.backgroundColor,
		};
	});
	check(
		"card glassmorphism (backdrop-blur-xl + bg-white/30)",
		cardStyle.bf.includes("blur(24px)") && isWhiteAtAlpha(cardStyle.bg, "0.3"),
		`${cardStyle.bf} | ${cardStyle.bg}`,
	);
	const cardBox = await card.boundingBox();
	check(
		"card anchored bottom-left on desktop",
		cardBox !== null && cardBox.x < 720 && cardBox.y > 450,
		JSON.stringify(cardBox),
	);

	// Bottom-right corner cutout
	check(
		"Documentation title visible",
		await page.getByText("Documentation").isVisible(),
	);
	check("Library link visible", await page.getByText("Library").isVisible());
	const corner = page
		.locator("div.absolute.bottom-0.right-0", { hasText: "Documentation" })
		.first();
	const cornerInfo = await corner.evaluate((el) => {
		const s = getComputedStyle(el);
		return {
			bg: s.backgroundColor,
			radius: s.borderTopLeftRadius,
			masks: el.querySelectorAll('svg path[fill="#f0f0f0"]').length,
			right: el.getBoundingClientRect().right,
			bottom: el.getBoundingClientRect().bottom,
		};
	});
	check(
		"corner bg #f0f0f0 (faux cutout)",
		cornerInfo.bg === "rgb(240, 240, 240)",
		cornerInfo.bg,
	);
	check(
		"corner rounded-tl 3.5rem at md+",
		cornerInfo.radius === "56px",
		cornerInfo.radius,
	);
	check(
		"both SVG intersection masks present",
		cornerInfo.masks === 2,
		`${cornerInfo.masks} masks`,
	);

	// Motion animations settled (opacity 1 after load)
	const settled = await page.evaluate(() => {
		const els = [document.querySelector("h1"), document.querySelector("p")];
		return els.every(
			(el) => el && parseFloat(getComputedStyle(el).opacity) > 0.79,
		);
	});
	check("motion entrance animations settled", settled);

	check("no page errors on desktop", errors.length === 0, errors.join("; "));
	await page.close();
}

/* ---------------- Mobile (390x844) ---------------- */
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	const errors = [];
	page.on("pageerror", (e) => errors.push(e.message));
	await page.goto(BASE, { waitUntil: "networkidle" });

	check(
		"mobile RIVR logo visible",
		await page.locator("span", { hasText: /^RIVR$/ }).isVisible(),
	);
	check(
		"desktop menu hidden on mobile",
		!(await page.locator("nav ul").isVisible()),
	);
	const h1Size = await page
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontSize);
	check(
		"h1 scales down on mobile (text-4xl = 36px)",
		h1Size === "36px",
		h1Size,
	);
	const card = page
		.locator("div.backdrop-blur-xl", { hasText: "Active Yielders" })
		.first();
	const box = await card.boundingBox();
	check(
		"card anchored bottom-right on mobile",
		box !== null && box.x > 195,
		JSON.stringify(box),
	);
	check(
		"Documentation corner visible on mobile",
		await page.getByText("Documentation").isVisible(),
	);
	check("no page errors on mobile", errors.length === 0, errors.join("; "));
	await page.close();
}

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
