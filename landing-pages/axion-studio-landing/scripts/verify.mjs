import { chromium } from "playwright";

const BASE = "http://localhost:4761/";
const results = [];
const check = (name, ok, extra = "") =>
	results.push(
		`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  -> ${extra}` : ""}`,
	);

const browser = await chromium.launch();
const errors = [];

// ---------- Desktop ----------
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Hero
check(
	"h1 headline text",
	(await page.locator("h1").innerText()).includes(
		"We craft digital experiences",
	),
);
const h1Size = await page
	.locator("h1")
	.evaluate((el) => getComputedStyle(el).fontSize);
check(
	"h1 clamp font-size at 1440px (expect 67.2px = 4.2rem)",
	h1Size === "67.2px",
	h1Size,
);
check(
	"shader canvas rendered",
	(await page.locator("section canvas").count()) > 0,
	`${await page.locator("canvas").count()} canvas`,
);
const shaderEl = page
	.locator("section > div.pointer-events-none.absolute.inset-0.z-10")
	.first();
check(
	"shader overlay abs/inset-0/z-10/pointer-events-none",
	(await shaderEl.count()) === 1,
);
check(
	"hero section min-h-screen",
	await page
		.locator("section")
		.first()
		.evaluate((el) => el.offsetHeight >= window.innerHeight),
);

// Nav
check(
	"nav links visible (desktop)",
	await page.locator("text=Journal").first().isVisible(),
);
const clockText = await page
	.locator("header span", { hasText: "in London" })
	.first()
	.innerText();
check(
	"live London clock HH:MM",
	/^\d{2}:\d{2} in London$/.test(clockText.trim()),
	clockText.trim(),
);
check(
	"Q1 2026 label visible at lg",
	await page.locator("text=Taking on projects for Q1 2026").isVisible(),
);
check(
	"nav CTA 'Book a strategy call'",
	(await page
		.locator("button", { hasText: "Book a strategy call" })
		.count()) === 1,
);
check(
	"mobile Menu button hidden on desktop",
	!(await page.locator("button", { hasText: "Menu" }).isVisible()),
);

// Text roll structure
const roll = page
	.locator("button", { hasText: "Book a strategy call" })
	.locator(
		"span.h-\\[20px\\].flex-col.overflow-hidden, span.flex.h-\\[20px\\].flex-col.overflow-hidden",
	);
check("text-roll window h-[20px] overflow-hidden", (await roll.count()) >= 1);
const dup = await page
	.locator("button", { hasText: "Book a strategy call" })
	.locator("span", { hasText: "Book a strategy call" })
	.count();
check("text duplicated for roll", dup >= 2, `${dup} copies`);

// Live clock ticks (check it matches London time)
const expected = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/London",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
}).format(new Date());
check(
	"clock equals actual London time",
	clockText.trim().startsWith(expected),
	`${clockText.trim()} vs ${expected}`,
);

// Partner badge
check(
	"Certified Partner badge",
	await page.locator("text=Certified Partner").isVisible(),
);
check("Featured chip", await page.locator("text=Featured").first().isVisible());
const svgPathLen = await page
	.locator("a:has-text('Certified Partner') svg path")
	.getAttribute("d");
check(
	"partner SVG path present (1023 chars)",
	(svgPathLen || "").length === 1023,
	`${(svgPathLen || "").length} chars`,
);

// About
check(
	"about heading",
	await page.locator("h2", { hasText: "Strategy-led creatives" }).isVisible(),
);
check(
	"badge '1' + Introducing Axion",
	await page.locator("text=Introducing Axion").isVisible(),
);
check(
	"desktop grid visible at lg",
	await page.locator(".lg\\:grid").first().isVisible(),
);
const gridCols = await page
	.locator(".lg\\:grid")
	.first()
	.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
check(
	"grid-cols-[26%_1fr_48%] computed",
	gridCols.split(" ").length === 3,
	gridCols,
);
await page.locator(".lg\\:grid img").first().scrollIntoViewIfNeeded();
await page
	.waitForFunction(
		() =>
			[...document.querySelectorAll(".lg\\:grid img")].every(
				(i) => i.complete && i.naturalWidth > 0,
			),
		null,
		{ timeout: 15000 },
	)
	.catch(() => {});
check(
	"about images load (desktop grid)",
	await page
		.locator(".lg\\:grid img")
		.evaluateAll(
			(imgs) =>
				imgs.length === 2 &&
				imgs.every((i) => i.complete && i.naturalWidth > 0),
		),
);
check(
	"about button 'About our studio'",
	(await page.locator("button", { hasText: "About our studio" }).count()) >= 1,
);

// Case studies
check(
	"Our projects heading",
	await page.locator("h2", { hasText: "Our projects" }).isVisible(),
);
check(
	"badge '2' + Featured client work",
	await page.locator("text=Featured client work").isVisible(),
);
check(
	"two videos with autoplay/muted/loop/playsinline",
	(await page.locator("video[autoplay][loop][playsinline]").count()) === 2,
);
const v1 = await page.locator("video").first().getAttribute("src");
check("Narrativ video src", (v1 || "").includes("hf_20260516_122702"));
check(
	"Narrativ desc",
	await page.locator("text=Winner of Site of the Month 2025").isVisible(),
);
check(
	"Luminar desc",
	await page.locator("text=Transforming a dated platform").isVisible(),
);
check(
	"Learn more hover pill",
	(await page.locator("text=Learn more").count()) === 1,
);
check(
	"View case study hover pill",
	(await page.locator("text=View case study").count()) === 1,
);

// Hover expansion behavior on card 1
const pill1 = page
	.locator("div.group", { has: page.locator("video") })
	.first()
	.locator("div.absolute.bottom-4.left-4");
const wBefore = await pill1.evaluate((el) => el.getBoundingClientRect().width);
await page.locator("div.group").first().hover();
await page.waitForTimeout(500);
const wAfter = await pill1.evaluate((el) => el.getBoundingClientRect().width);
check(
	"card pill expands on hover (36px -> 148px)",
	Math.round(wBefore) === 36 && Math.round(wAfter) === 148,
	`${wBefore} -> ${wAfter}`,
);

// liquid-glass utilities exist in CSS
const hasLiquid = await page.evaluate(async () => {
	const sheets = [...document.styleSheets];
	let txt = "";
	for (const s of sheets) {
		try {
			txt += [...s.cssRules].map((r) => r.cssText).join("\n");
		} catch {}
	}
	return {
		a: txt.includes(".liquid-glass"),
		b: txt.includes(".liquid-glass-strong"),
	};
});
check("liquid-glass utility in CSS", hasLiquid.a);
check("liquid-glass-strong utility in CSS", hasLiquid.b);

await page.screenshot({ path: "/tmp/axion-desktop.png", fullPage: true });

// ---------- Mobile ----------
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on(
	"console",
	(m) => m.type() === "error" && errors.push(`[mobile] ${m.text()}`),
);
mob.on("pageerror", (e) => errors.push(`[mobile] PAGEERROR: ${e.message}`));
await mob.goto(BASE, { waitUntil: "networkidle" });
await mob.waitForTimeout(1500);

check(
	"mobile Menu button visible",
	await mob.locator("button", { hasText: "Menu" }).isVisible(),
);
check(
	"desktop nav links hidden on mobile",
	!(await mob.locator("header a", { hasText: "Journal" }).first().isVisible()),
);
const h1SizeMob = await mob
	.locator("h1")
	.evaluate((el) => getComputedStyle(el).fontSize);
check(
	"h1 mobile clamp (390*7vw=27.3 -> min 28px)",
	h1SizeMob === "28px",
	h1SizeMob,
);

// open mobile menu
await mob.locator("button", { hasText: "Menu" }).click();
await mob.waitForTimeout(700);
check(
	"menu toggle becomes Close",
	await mob.locator("button", { hasText: "Close" }).isVisible(),
);
const sheet = mob.locator("div.fixed.inset-0.z-50 > div").nth(1);
check(
	"bottom sheet slid up",
	await sheet.evaluate((el) => {
		const r = el.getBoundingClientRect();
		return r.bottom <= window.innerHeight && r.height > 100;
	}),
);
const linkSize = await mob
	.locator("div.fixed.inset-0.z-50 nav a")
	.first()
	.evaluate((el) => getComputedStyle(el).fontSize);
check("overlay nav links 28px on mobile", linkSize === "28px", linkSize);
check(
	"overlay has Start a project",
	await mob
		.locator("div.fixed.inset-0.z-50 button", { hasText: "Start a project" })
		.isVisible(),
);
check(
	"overlay has time badge",
	await mob
		.locator("div.fixed.inset-0.z-50 span", { hasText: "in London" })
		.first()
		.isVisible(),
);
await mob.screenshot({ path: "/tmp/axion-mobile-menu.png" });

// close via the Close toggle (navbar must stack above the backdrop)
await mob.locator("button", { hasText: "Close" }).click();
await mob.waitForTimeout(700);
check(
	"menu closes via Close toggle",
	await mob.locator("button", { hasText: "Menu" }).isVisible(),
);

// re-open, then close via backdrop
await mob.locator("button", { hasText: "Menu" }).click();
await mob.waitForTimeout(700);
await mob.mouse.click(195, 400);
await mob.waitForTimeout(700);
check(
	"menu closes via backdrop",
	await mob.locator("button", { hasText: "Menu" }).isVisible(),
);
await mob.screenshot({ path: "/tmp/axion-mobile.png", fullPage: true });

await browser.close();

console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL"));
const realErrors = errors.filter(
	(e) => !/WebGPU|GPU|webgpu|Autoplay|play\(\)/i.test(e),
);
console.log(
	`\n${results.length - fails.length}/${results.length} checks passed`,
);
console.log(
	"Console/page errors (filtered):",
	realErrors.length ? realErrors : "none",
);
console.log(
	"All console errors raw:",
	errors.length ? errors.slice(0, 10) : "none",
);
process.exit(fails.length || realErrors.length ? 1 : 0);
