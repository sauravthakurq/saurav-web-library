/* Headless verification of the SkyElite hero against a running server.
   Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4719) */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4719";
const VIDEO_URL =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};

const browser = await chromium.launch();

/* ---------------- Desktop ---------------- */
{
	const page = await browser.newPage({
		viewport: { width: 1440, height: 900 },
	});
	await page.goto(BASE, { waitUntil: "networkidle" });

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
	check("video is actually playing (currentTime advancing)", playing);

	const bodyFont = await page.evaluate(
		() => getComputedStyle(document.body).fontFamily,
	);
	check("body font is Inter", bodyFont.startsWith("Inter"), bodyFont);

	check(
		'brand "SkyElite" visible',
		await page.getByText("SkyElite").isVisible(),
	);
	for (const item of ["Start", "Story", "Rates", "Benefits", "FAQ"]) {
		check(
			`desktop nav link "${item}" visible`,
			await page.locator(`nav >> text=${item}`).isVisible(),
		);
	}
	check(
		"hamburger hidden on desktop",
		!(await page.getByRole("button", { name: "Open menu" }).isVisible()),
	);

	const premium = page.getByText("Premium.", { exact: true });
	const accessible = page.getByText("Accessible.", { exact: true });
	check('heading line 1 "Premium." visible', await premium.isVisible());
	check('heading line 2 "Accessible." visible', await accessible.isVisible());

	const a = await accessible.evaluate((el) => {
		const cs = getComputedStyle(el);
		return { color: cs.color, marginTop: cs.marginTop, fontSize: cs.fontSize };
	});
	check(
		'"Accessible." color is #202A36',
		a.color === "rgb(32, 42, 54)",
		a.color,
	);
	check(
		'"Accessible." overlap margin-top -12px',
		a.marginTop === "-12px",
		a.marginTop,
	);
	check("lg:text-8xl applied at 1440px", a.fontSize === "96px", a.fontSize);

	const pColor = await premium.evaluate((el) => getComputedStyle(el).color);
	check('"Premium." is gray-500', pColor === "rgb(107, 114, 128)", pColor);

	check(
		"subtitle visible",
		await page.getByText("Your dedication deserves recognition.").isVisible(),
	);

	const bookNow = page.getByRole("button", { name: "Book Now" });
	const b = await bookNow.evaluate((el) => {
		const cs = getComputedStyle(el);
		return { bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius };
	});
	check('"Book Now" bg #202A36', b.bg === "rgb(32, 42, 54)", b.bg);
	check('"Book Now" white text', b.color === "rgb(255, 255, 255)", b.color);
	check('"Book Now" pill shape', parseFloat(b.radius) > 100, b.radius);

	const discover = page.getByRole("button", { name: "Discover" });
	const dBg = await discover.evaluate(
		(el) => getComputedStyle(el).backgroundColor,
	);
	check('"Discover" bg gray-300', dBg === "rgb(209, 213, 219)", dBg);

	await bookNow.hover();
	await page.waitForTimeout(350);
	const hoverBg = await bookNow.evaluate(
		(el) => getComputedStyle(el).backgroundColor,
	);
	check('"Book Now" hover -> #1a2229', hoverBg === "rgb(26, 34, 41)", hoverBg);

	const contentMt = await page
		.locator("main > div")
		.evaluate((el) => getComputedStyle(el).marginTop);
	check(
		"hero content pulled up by -mt-80 (-320px)",
		contentMt === "-320px",
		contentMt,
	);

	await page.screenshot({ path: "/tmp/skyelite-desktop.png" });
	await page.close();
}

/* ---------------- Mobile ---------------- */
{
	const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
	await page.goto(BASE, { waitUntil: "networkidle" });

	check(
		"desktop menu hidden on mobile",
		!(await page.locator("nav >> text=Rates").isVisible()),
	);

	const toggle = page.getByRole("button", { name: "Open menu" });
	check("hamburger visible on mobile", await toggle.isVisible());

	await toggle.click();
	const dropdown = page.locator("#mobile-menu");
	await dropdown.waitFor({ state: "visible" });
	check("mobile dropdown opens", await dropdown.isVisible());

	const d = await dropdown.evaluate((el) => {
		const cs = getComputedStyle(el);
		return {
			bg: cs.backgroundColor,
			blur: cs.backdropFilter || cs.webkitBackdropFilter,
			radius: cs.borderRadius,
			shadow: cs.boxShadow !== "none",
		};
	});
	check("dropdown bg white/95", d.bg === "rgba(255, 255, 255, 0.95)", d.bg);
	check("dropdown backdrop blur", /blur/.test(d.blur), d.blur);
	check("dropdown rounded corners", parseFloat(d.radius) >= 12, d.radius);
	check("dropdown has shadow", d.shadow);

	const linkCount = await dropdown.locator("a").count();
	check("dropdown lists 5 menu items", linkCount === 5, String(linkCount));

	const mobileHeadingSize = await page
		.getByText("Accessible.", { exact: true })
		.evaluate((el) => getComputedStyle(el).fontSize);
	check(
		"base text-6xl applied on mobile",
		mobileHeadingSize === "60px",
		mobileHeadingSize,
	);

	await page.screenshot({ path: "/tmp/skyelite-mobile-menu.png" });

	await page.getByRole("button", { name: "Close menu" }).click();
	await dropdown.waitFor({ state: "detached" });
	check(
		"dropdown closes via X",
		(await page.locator("#mobile-menu").count()) === 0,
	);

	await page.close();
}

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
