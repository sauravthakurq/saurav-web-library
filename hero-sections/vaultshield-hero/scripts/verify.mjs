/* Headless verification of the VaultShield hero against a running server.
   Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4723) */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4723";
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_003132_8b7edcb6-c64d-4a52-a9ca-879942e122ad.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};

const browser = await chromium.launch();

/* ---------------- Desktop (1440x900) ---------------- */
{
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	await page.goto(BASE, { waitUntil: "networkidle" });
	await page.waitForTimeout(1500); // let entrance animations settle

	/* Background video */
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

	/* CSS variables */
	const vars = await page.evaluate(() => {
		const cs = getComputedStyle(document.documentElement);
		return {
			heading: cs.getPropertyValue("--font-heading").trim(),
			body: cs.getPropertyValue("--font-body").trim(),
			text: cs.getPropertyValue("--color-text").trim(),
			accent: cs.getPropertyValue("--color-accent").trim(),
			loginBg: cs.getPropertyValue("--color-login-bg").trim(),
		};
	});
	check(
		"--font-heading var",
		vars.heading.includes("Helvetica Now Display Bold"),
		vars.heading,
	);
	check("--font-body var", vars.body.includes("Inter"), vars.body);
	check("--color-text var", vars.text === "#192837", vars.text);
	check("--color-accent var", vars.accent === "#7342E2", vars.accent);
	check("--color-login-bg var", vars.loginBg === "#F2F2EE", vars.loginBg);

	const bodyFont = await page.evaluate(
		() => getComputedStyle(document.body).fontFamily,
	);
	check("body font is Inter", bodyFont.includes("Inter"), bodyFont);

	/* Navbar */
	check(
		"logo svg in header",
		(await page.locator('header svg[viewBox="0 0 256 256"]').count()) >= 1,
	);
	for (const item of ["Vault", "Plans", "Install", "News", "Help"]) {
		check(
			`desktop nav link "${item}" visible`,
			await page.locator(`nav >> text=${item}`).first().isVisible(),
		);
	}
	const startBtn = page.getByRole("button", { name: "Start For Free" }).first();
	const signBtn = page.getByRole("button", { name: "Sign In" }).first();
	const sb = await startBtn.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			bg: cs.backgroundColor,
			color: cs.color,
			radius: parseFloat(cs.borderRadius),
		};
	});
	check('"Start For Free" bg #7342E2', sb.bg === "rgb(115, 66, 226)", sb.bg);
	check(
		'"Start For Free" white text',
		sb.color === "rgb(255, 255, 255)",
		sb.color,
	);
	check('"Start For Free" pill', sb.radius > 100, String(sb.radius));
	const gb = await signBtn.evaluate((el) => {
		const cs = getComputedStyle(el);
		return { bg: cs.backgroundColor, color: cs.color };
	});
	check('"Sign In" bg #F2F2EE', gb.bg === "rgb(242, 242, 238)", gb.bg);
	check('"Sign In" dark text', gb.color === "rgb(25, 40, 55)", gb.color);
	check(
		"hamburger hidden on desktop",
		!(await page.getByRole("button", { name: "Open menu" }).isVisible()),
	);

	/* Heading */
	const h1 = page.locator("h1");
	const headingText = (await h1.innerText()).replace(/\s+/g, " ").trim();
	check(
		"heading text correct",
		headingText === "Lock Down Your Passwords with Ironclad Security",
		headingText,
	);
	const h = await h1.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			font: cs.fontFamily,
			size: cs.fontSize,
			lineHeight: cs.lineHeight,
			letterSpacing: cs.letterSpacing,
			color: cs.color,
			marginBottom: cs.marginBottom,
			opacity: cs.opacity,
			icons: el.querySelectorAll("svg").length,
			iconWidth: el.querySelector("svg")?.getAttribute("width"),
		};
	});
	check(
		"heading font Helvetica Now Display Bold",
		h.font.includes("Helvetica Now Display Bold"),
		h.font,
	);
	check(
		"heading size 48px at 1440w (clamp cap 3rem)",
		h.size === "48px",
		h.size,
	);
	check(
		"heading line-height 1.05 (50.4px)",
		h.lineHeight === "50.4px",
		h.lineHeight,
	);
	check(
		"heading letter-spacing -0.01em (-0.48px)",
		h.letterSpacing === "-0.48px",
		h.letterSpacing,
	);
	check("heading color #192837", h.color === "rgb(25, 40, 55)", h.color);
	check(
		"heading margin-bottom 24px",
		h.marginBottom === "24px",
		h.marginBottom,
	);
	check("heading fully faded in (opacity 1)", h.opacity === "1", h.opacity);
	check("heading has 3 inline lucide icons", h.icons === 3, String(h.icons));
	check("inline icons are 24px", h.iconWidth === "24", String(h.iconWidth));

	/* Subtext */
	const sub = page.getByText("Zero stress, total control.", { exact: false });
	check("subtext visible", await sub.isVisible());
	const s = await sub.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			size: cs.fontSize,
			lineHeight: cs.lineHeight,
			opacity: cs.opacity,
			maxWidth: cs.maxWidth,
		};
	});
	check("subtext size 1.1rem (17.6px) at 1440w", s.size === "17.6px", s.size);
	check(
		"subtext line-height 1.65 (29.04px)",
		s.lineHeight === "29.04px",
		s.lineHeight,
	);
	check("subtext resting opacity 0.8", s.opacity === "0.8", s.opacity);
	check("subtext max-width 560px", s.maxWidth === "560px", s.maxWidth);

	/* Hero container */
	const padTop = await page
		.locator("main > div")
		.evaluate((el) => getComputedStyle(el).paddingTop);
	check("hero paddingTop 72px at 1440w (clamp cap)", padTop === "72px", padTop);
	const blockMax = await page
		.locator("main > div")
		.evaluate((el) => getComputedStyle(el).maxWidth);
	check("hero content block max-width 560px", blockMax === "560px", blockMax);

	/* CTA */
	const cta = page.getByRole("button", { name: "Get It Free" });
	check("CTA visible", await cta.isVisible());
	const c = await cta.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			bg: cs.backgroundColor,
			color: cs.color,
			radius: cs.borderRadius,
			padding: cs.padding,
			shadow: cs.boxShadow,
			minWidth: cs.minWidth,
			gap: cs.gap,
			justify: cs.justifyContent,
			icons: el.querySelectorAll("svg").length,
			iconWidth: el.querySelector("svg")?.getAttribute("width"),
			opacity: cs.opacity,
		};
	});
	check("CTA bg #7342E2", c.bg === "rgb(115, 66, 226)", c.bg);
	check("CTA white text", c.color === "rgb(255, 255, 255)", c.color);
	check("CTA radius 50px", c.radius === "50px", c.radius);
	check("CTA padding 17px 24px", c.padding === "17px 24px", c.padding);
	check(
		"CTA glow shadow",
		c.shadow.includes("rgba(115, 66, 226, 0.28)"),
		c.shadow,
	);
	check("CTA min-width 210px", c.minWidth === "210px", c.minWidth);
	check("CTA gap 32px", c.gap === "32px", c.gap);
	check("CTA space-between", c.justify === "space-between", c.justify);
	check(
		"CTA has ArrowRightCircle icon @20px",
		c.icons === 1 && c.iconWidth === "20",
	);
	check("CTA fully faded in (opacity 1)", c.opacity === "1", c.opacity);

	/* CTA hover scale */
	await cta.hover();
	await page.waitForTimeout(450);
	const hovered = await cta.evaluate((el) => {
		const cs = getComputedStyle(el);
		return { transform: cs.transform, filter: cs.filter };
	});
	check(
		"CTA hover scales up",
		/matrix\(1\.0[3-4]/.test(hovered.transform),
		hovered.transform,
	);
	check(
		"CTA hover brightens",
		/brightness\(1\.0[5-9]|brightness\(1\.1/.test(hovered.filter),
		hovered.filter,
	);

	await page.screenshot({ path: "/tmp/vaultshield-desktop.png" });
	await page.close();
}

/* ---------------- Mobile (390x844) ---------------- */
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await page.goto(BASE, { waitUntil: "networkidle" });
	await page.waitForTimeout(1200);

	check(
		"desktop nav hidden on mobile",
		!(await page.locator("nav >> text=Plans").first().isVisible()),
	);
	const toggle = page.getByRole("button", { name: "Open menu" });
	check("hamburger visible on mobile", await toggle.isVisible());

	const mobileH = await page
		.locator("h1")
		.evaluate((el) => getComputedStyle(el).fontSize);
	check(
		"heading clamps to 1.65rem (26.4px) on mobile",
		mobileH === "26.4px",
		mobileH,
	);

	/* Open sheet */
	await toggle.click();
	const sheet = page.getByRole("dialog", { name: "Mobile navigation" });
	await sheet.waitFor({ state: "visible" });
	await page.waitForTimeout(1300); // slide-in (0.45s) + last link stagger (0.46s delay + 0.45s)
	const sh = await sheet.evaluate((el) => {
		const cs = getComputedStyle(el);
		const r = el.getBoundingClientRect();
		return {
			bg: cs.backgroundColor,
			width: r.width,
			height: r.height,
			right: r.right,
			shadow: cs.boxShadow,
			x: new DOMMatrixReadOnly(cs.transform).m41,
		};
	});
	check("sheet bg #CFC8C5", sh.bg === "rgb(207, 200, 197)", sh.bg);
	check(
		"sheet width min(88vw,360px) = 343.2px",
		Math.abs(sh.width - 343.2) < 1,
		String(sh.width),
	);
	check(
		"sheet full height (100dvh)",
		Math.abs(sh.height - 844) < 1,
		String(sh.height),
	);
	check("sheet flush right", Math.abs(sh.right - 390) < 1, String(sh.right));
	check(
		"sheet shadow",
		sh.shadow.includes("rgba(25, 40, 55, 0.18)"),
		sh.shadow,
	);
	check("sheet slid fully in (x=0)", Math.abs(sh.x) < 0.5, String(sh.x));

	/* Regression: sheet must paint ABOVE the hero content (stacking context bug) */
	const sheetOnTop = await sheet.evaluate((el) => {
		const r = el.getBoundingClientRect();
		const top = document.elementFromPoint(
			r.left + r.width / 2,
			r.top + r.height / 2,
		);
		return top !== null && el.contains(top);
	});
	check("sheet paints above hero content", sheetOnTop);

	/* Backdrop */
	const backdrop = await page.evaluate(() => {
		const els = [...document.querySelectorAll("div")];
		const el = els.find(
			(d) => getComputedStyle(d).backgroundColor === "rgba(25, 40, 55, 0.35)",
		);
		if (!el) return null;
		const cs = getComputedStyle(el);
		return {
			blur: cs.backdropFilter || cs.webkitBackdropFilter,
			position: cs.position,
		};
	});
	check("backdrop rgba(25,40,55,0.35) present", backdrop !== null);
	check(
		"backdrop blur(4px)",
		backdrop?.blur === "blur(4px)",
		backdrop?.blur ?? "none",
	);
	check(
		"backdrop fixed",
		backdrop?.position === "fixed",
		backdrop?.position ?? "none",
	);

	/* Sheet content */
	const sheetLinks = await sheet.locator("nav a").count();
	check("sheet lists 5 nav links", sheetLinks === 5, String(sheetLinks));
	check(
		"sheet has Start For Free CTA",
		await sheet.getByRole("button", { name: "Start For Free" }).isVisible(),
	);
	check(
		"sheet has Sign In CTA",
		await sheet.getByRole("button", { name: "Sign In" }).isVisible(),
	);
	check(
		"sheet links faded in (stagger done)",
		await sheet
			.locator("nav a")
			.last()
			.evaluate((el) => getComputedStyle(el).opacity === "1"),
	);

	await page.screenshot({ path: "/tmp/vaultshield-mobile-menu.png" });

	/* Close via X */
	await sheet.getByRole("button", { name: "Close menu" }).click();
	await sheet.waitFor({ state: "detached" });
	check("sheet closes via X", (await page.getByRole("dialog").count()) === 0);

	/* Close via Escape */
	await toggle.click();
	await page
		.getByRole("dialog", { name: "Mobile navigation" })
		.waitFor({ state: "visible" });
	await page.keyboard.press("Escape");
	await page
		.getByRole("dialog", { name: "Mobile navigation" })
		.waitFor({ state: "detached" });
	check(
		"sheet closes via Escape",
		(await page.getByRole("dialog").count()) === 0,
	);

	await page.screenshot({ path: "/tmp/vaultshield-mobile.png" });
	await page.close();
}

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
