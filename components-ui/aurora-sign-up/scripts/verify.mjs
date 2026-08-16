/* Headless CLI verification for Aurora Sign Up.
 * Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4173)
 */
import { chromium } from "playwright";

const BASE_URL = process.argv[2] ?? "http://localhost:4173";
const VIDEO_SRC =
	"https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on(
	"console",
	(msg) => msg.type() === "error" && consoleErrors.push(msg.text()),
);
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1800); // let staggered reveal finish

check(
	"page title",
	(await page.title()) === "Aurora Sign Up",
	await page.title(),
);

// ── Main layout ──────────────────────────────────────────────────────────
const mainClass = await page.locator("main").getAttribute("class");
for (const cls of [
	"flex",
	"min-h-screen",
	"w-full",
	"bg-black",
	"selection:bg-white/30",
	"p-2",
	"lg:h-screen",
	"lg:overflow-hidden",
	"lg:p-4",
]) {
	check(`main has ${cls}`, mainClass.includes(cls));
}

// ── Hero / video ─────────────────────────────────────────────────────────
const video = page.locator("video");
check("video exists", (await video.count()) === 1);
check(
	"video source exact",
	(await page.locator("video source").getAttribute("src")) === VIDEO_SRC,
);
check(
	"video source type",
	(await page.locator("video source").getAttribute("type")) === "video/mp4",
);
const videoProps = await video.evaluate((v) => ({
	autoplay: v.autoplay,
	muted: v.muted,
	loop: v.loop,
	playsInline: v.hasAttribute("playsinline"),
}));
for (const [k, v] of Object.entries(videoProps))
	check(`video ${k}`, v === true);

// No overlay: the hero section must contain exactly the video + content div.
const heroChildren = await page
	.locator("main > section")
	.first()
	.evaluate((s) => s.childElementCount);
check(
	"no overlay over video (hero has exactly 2 children)",
	heroChildren === 2,
	`children=${heroChildren}`,
);

// Hero is 52% of its row at lg.
const heroBox = await page.locator("main > section").first().boundingBox();
const mainBox = await page.locator("main").boundingBox();
const pct = heroBox.width / (mainBox.width - 32); // minus lg:p-4 padding
check(
	"hero width ≈ 52%",
	Math.abs(pct - 0.52) < 0.01,
	`${(pct * 100).toFixed(2)}%`,
);

// Hero copy + steps
for (const text of [
	"Aurora",
	"Join Aurora",
	"Follow these 3 quick phases to activate your space.",
	"Register your identity",
	"Configure your studio",
	"Finalize your profile",
]) {
	check(
		`hero text "${text}"`,
		(await page.getByText(text, { exact: false }).count()) >= 1,
	);
}
const activeClass = await page
	.getByText("Register your identity")
	.evaluate((el) => el.closest("div").className);
check(
	"active StepItem styled (bg-white text-black)",
	activeClass.includes("bg-white") && activeClass.includes("text-black"),
	activeClass,
);
const inactiveClass = await page
	.getByText("Configure your studio")
	.evaluate((el) => el.closest("div").className);
check(
	"inactive StepItem styled (bg-brand-gray)",
	inactiveClass.includes("bg-brand-gray"),
	inactiveClass,
);

// Hero reveal animation completed (opacity 1)
const heroOpacity = await page
	.locator("main > section")
	.first()
	.locator("> div")
	.evaluate((el) => getComputedStyle(el).opacity);
check(
	"hero stagger container revealed",
	Number(heroOpacity) === 1,
	`opacity=${heroOpacity}`,
);

// ── Form column ──────────────────────────────────────────────────────────
for (const text of [
	"Create New Profile",
	"Input your basic details to begin the journey.",
	"Or",
	"Requires at least 8 symbols.",
	"Member of the team?",
	"Log in",
]) {
	check(
		`form text "${text}"`,
		(await page.getByText(text, { exact: false }).count()) >= 1,
	);
}
check(
	"Google social button",
	(await page.getByRole("button", { name: "Google" }).count()) === 1,
);
check(
	"Github social button",
	(await page.getByRole("button", { name: "Github" }).count()) === 1,
);
for (const label of ["First Name", "Last Name", "Email", "Password"]) {
	check(
		`input "${label}"`,
		(await page.getByLabel(label, { exact: true }).count()) === 1,
	);
}
check(
	"submit button",
	(await page.getByRole("button", { name: "Create Account" }).count()) === 1,
);

// Password visibility toggle
const pw = page.getByLabel("Password", { exact: true });
check(
	"password initially masked",
	(await pw.getAttribute("type")) === "password",
);
await page.getByRole("button", { name: "Show password" }).click();
check("toggle reveals password", (await pw.getAttribute("type")) === "text");
await page.getByRole("button", { name: "Hide password" }).click();
check(
	"toggle masks password again",
	(await pw.getAttribute("type")) === "password",
);

// Inter font applied to body
const bodyFont = await page.evaluate(
	() => getComputedStyle(document.body).fontFamily,
);
check("Inter font on body", bodyFont.includes("Inter"), bodyFont);
// brand-gray color resolved on an input
const inputBg = await page
	.getByLabel("Email")
	.evaluate((el) => getComputedStyle(el).backgroundColor);
check("brand-gray (#1A1A1A) on inputs", inputBg === "rgb(26, 26, 26)", inputBg);

// ── Responsive: hero hidden on mobile ────────────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
check(
	"hero hidden on mobile",
	!(await page.locator("main > section").first().isVisible()),
);
check(
	"form visible on mobile",
	await page.getByRole("button", { name: "Create Account" }).isVisible(),
);

check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ").slice(0, 300),
);

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
