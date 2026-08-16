import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:4173";
let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures++;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE, { waitUntil: "networkidle" });

// --- Page basics ---
check("title", (await page.title()).includes("Stellar.ai"));
const bodyFont = await page.evaluate(
	() => getComputedStyle(document.body).fontFamily,
);
check("body font is Inter", bodyFont.includes("Inter"), bodyFont);
const fontLink = await page
	.locator('link[href*="fonts.googleapis.com"][href*="Inter"]')
	.count();
check("Google Fonts Inter link", fontLink === 1);
const bodyBg = await page.evaluate(
	() =>
		getComputedStyle(document.querySelector(".min-h-screen")).backgroundColor,
);
check("white background", bodyBg === "rgb(255, 255, 255)", bodyBg);

// --- Navigation ---
check(
	"logo text",
	(await page.getByText("Stellar.ai", { exact: true }).count()) >= 1,
);
for (const item of [
	"Solutions",
	"For Teams",
	"About Us",
	"Learn Hub",
	"Login",
]) {
	check(
		`nav link: ${item}`,
		(await page.getByText(item, { exact: true }).count()) >= 1,
	);
}
check(
	"Get started free button",
	(await page.getByRole("button", { name: "Get started free" }).count()) === 1,
);
const chevrons = await page.locator("nav .lucide-chevron-down").count();
check("two ChevronDown icons in nav", chevrons === 2, `found ${chevrons}`);

// --- Hero ---
check(
	"reviews badge",
	(await page.getByText("4.9 rating from 18.3K+ users").count()) === 1,
);
check(
	"heading line 1",
	(await page.getByText("Work Smarter. Move Faster.").count()) === 1,
);
check(
	"heading line 2",
	(await page.getByText("AI Powers You Up.").count()) === 1,
);
const gradientClasses = await page
	.locator("h1 span")
	.first()
	.getAttribute("class");
check(
	"gradient on heading line 2",
	gradientClasses.includes("bg-gradient-to-r") &&
		gradientClasses.includes("bg-clip-text") &&
		gradientClasses.includes("text-transparent"),
	gradientClasses,
);
check(
	"subheading",
	(await page
		.getByText("Intelligent automation syncs with the tools you love")
		.count()) === 1,
);
check(
	"CTA button",
	(await page.getByRole("button", { name: "Begin Free Trial" }).count()) === 1,
);

// --- Staggered animations ---
const delays = await page.evaluate(() =>
	[...document.querySelectorAll(".animate-fade-in-up")].map(
		(el) => el.style.animationDelay,
	),
);
check(
	"staggered delays 0.1s → 0.8s",
	JSON.stringify(delays) ===
		JSON.stringify([
			"0.1s",
			"0.2s",
			"0.3s",
			"0.4s",
			"0.5s",
			"0.6s",
			"0.7s",
			"0.8s",
		]),
	delays.join(","),
);
const animName = await page.evaluate(
	() =>
		getComputedStyle(document.querySelector(".animate-fade-in-up"))
			.animationName,
);
check("fadeInUp keyframes applied", animName === "fadeInUp", animName);
// after animations complete, elements must be visible (forwards fill)
await page.waitForTimeout(1700);
const h1Opacity = await page.evaluate(
	() => getComputedStyle(document.querySelector("h1")).opacity,
);
check(
	"heading visible after animation",
	h1Opacity === "1",
	`opacity=${h1Opacity}`,
);

// --- Tab bar (desktop) ---
const desktopBar = page.locator(
	"div.hidden.md\\:flex.items-center.bg-gray-100",
);
for (const tab of ["Analyse", "Train", "Testing", "Deploy"]) {
	check(
		`tab: ${tab}`,
		(await desktopBar.getByRole("button", { name: tab }).count()) === 1,
	);
}
const dividers = await desktopBar.locator(".w-px.h-5.bg-gray-300").count();
check("3 vertical dividers", dividers === 3, `found ${dividers}`);
const analyseClass = await desktopBar
	.getByRole("button", { name: "Analyse" })
	.getAttribute("class");
check(
	"Analyse active initially",
	analyseClass.includes("bg-white") && analyseClass.includes("shadow-sm"),
);

// --- Video ---
const video = page.locator("video");
check("video element", (await video.count()) === 1);
const videoAttrs = await video.evaluate((v) => ({
	src: v.getAttribute("src"),
	autoplay: v.autoplay,
	loop: v.loop,
	muted: v.muted,
	playsInline: v.hasAttribute("playsinline"),
}));
check(
	"video src",
	videoAttrs.src?.startsWith("https://d8j0ntlcm91z4.cloudfront.net/"),
	videoAttrs.src,
);
check(
	"video autoplay/loop/muted/playsInline",
	videoAttrs.autoplay &&
		videoAttrs.loop &&
		videoAttrs.muted &&
		videoAttrs.playsInline,
);

// --- Overlays: initial + click-through each tab ---
check(
	"Analyse overlay visible initially",
	await page.getByText("Set Up Your AI Workspace").isVisible(),
);
check(
	"purple progress bar",
	(await page
		.locator(".bg-purple-600.w-1\\/4, .w-1\\/4.bg-purple-600")
		.count()) >= 1,
);

await desktopBar.getByRole("button", { name: "Train" }).click();
check("Train overlay", await page.getByText("AI Model Training").isVisible());
check("orange progress at 67%", await page.getByText("67%").isVisible());

await desktopBar.getByRole("button", { name: "Testing" }).click();
check(
	"Testing overlay",
	await page.getByText("Test Suite Results").isVisible(),
);
check("127/127 tests", (await page.locator("text=/127/").count()) >= 1);

await desktopBar.getByRole("button", { name: "Deploy" }).click();
check(
	"Deploy overlay",
	await page.getByText("Deploy to Production").isVisible(),
);
check(
	"Deploy Now button",
	await page.getByRole("button", { name: "Deploy Now" }).isVisible(),
);
const checklistItems = await page
	.locator(".animate-slide-up-overlay ul li")
	.count();
check(
	"4 deploy checklist items",
	checklistItems === 4,
	`found ${checklistItems}`,
);

// --- Auto-cycle: Deploy should advance to Analyse within ~4s ---
await page.waitForTimeout(4300);
const analyseAfterCycle = await desktopBar
	.getByRole("button", { name: "Analyse" })
	.getAttribute("class");
check(
	"auto-cycles after 4s (deploy → analyse)",
	analyseAfterCycle.includes("bg-white"),
);
check(
	"overlay follows auto-cycle",
	await page.getByText("Set Up Your AI Workspace").isVisible(),
);

// --- Company logos ---
for (const logo of [
	"INTERSCOPE",
	"SPOTIFY",
	"Nexera",
	"M3",
	"LAURA COLE",
	"vertex",
]) {
	check(
		`logo: ${logo}`,
		(await page.getByText(logo, { exact: true }).count()) === 1,
	);
}

// --- Mobile layout ---
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
check(
	"mobile: 2x2 tab grid visible",
	await page.locator(".md\\:hidden.grid.grid-cols-2").isVisible(),
);
check("mobile: desktop bar hidden", !(await desktopBar.isVisible()));
check(
	"mobile: center nav hidden",
	!(await page.getByText("Learn Hub").isVisible()),
);

// --- Console errors (ignore video network noise in headless) ---
const realErrors = consoleErrors.filter(
	(e) => !/video|media|net::|Failed to load resource/i.test(e),
);
check("no console errors", realErrors.length === 0, realErrors.join(" | "));

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
