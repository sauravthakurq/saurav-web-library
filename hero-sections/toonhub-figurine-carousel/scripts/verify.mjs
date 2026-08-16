/* Headless verification of the TOONHUB hero against the spec.
 * Run: node scripts/verify.mjs <url>
 */
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173/";
const EXPECTED_BGS = [
	"rgb(244, 132, 95)",
	"rgb(107, 191, 122)",
	"rgb(232, 130, 180)",
	"rgb(110, 181, 255)",
];

let failures = 0;
function check(name, ok, detail = "") {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
	if (!ok) failures += 1;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const consoleErrors = [];
page.on("console", (msg) => {
	if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

await page.goto(url, { waitUntil: "networkidle" });

// --- Static structure ---
check("Page title contains TOONHUB", (await page.title()).includes("TOONHUB"));

const fontLink = page.locator('link[href*="fonts.googleapis.com/css2"]');
check(
	"Google Fonts link (Anton + Inter) present",
	(await fontLink.count()) === 1,
);
const fontHref = await fontLink.getAttribute("href");
check(
	"Font link requests Anton and Inter",
	fontHref.includes("Anton") && fontHref.includes("Inter"),
);

const ghost = page.locator("h1", { hasText: "3D SHAPE" });
check('Ghost text "3D SHAPE" rendered', (await ghost.count()) === 1);
const ghostStyle = await ghost.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		family: cs.fontFamily,
		weight: cs.fontWeight,
		color: cs.color,
		whiteSpace: cs.whiteSpace,
	};
});
check(
	"Ghost text uses Anton",
	ghostStyle.family.includes("Anton"),
	ghostStyle.family,
);
check(
	"Ghost text weight 900, white, nowrap",
	ghostStyle.weight === "900" &&
		ghostStyle.color === "rgb(255, 255, 255)" &&
		ghostStyle.whiteSpace === "nowrap",
	JSON.stringify(ghostStyle),
);

check(
	"Brand label TOONHUB present",
	(await page.locator("span", { hasText: /^TOONHUB$/ }).count()) === 1,
);
check(
	"TOONHUB FIGURINES heading present",
	(await page.getByText("TOONHUB FIGURINES").count()) === 1,
);
check(
	"Testimonial paragraph present",
	(await page
		.getByText("The artwork is stunning", { exact: false })
		.count()) === 1,
);
const discover = page.locator("a", { hasText: "DISCOVER IT" });
check("DISCOVER IT link present", (await discover.count()) === 1);
check(
	"DISCOVER IT uses Anton",
	(await discover.evaluate((el) => getComputedStyle(el).fontFamily)).includes(
		"Anton",
	),
);

const grain = await page.evaluate(() => {
	const els = [...document.querySelectorAll("div")];
	const g = els.find((el) =>
		getComputedStyle(el).backgroundImage.includes("data:image/svg+xml"),
	);
	if (!g) return null;
	const cs = getComputedStyle(g);
	return {
		size: cs.backgroundSize,
		opacity: cs.opacity,
		zIndex: cs.zIndex,
		pointerEvents: cs.pointerEvents,
	};
});
check(
	"Grain overlay present (SVG data URI, 200px, opacity 0.4, z-50, no pointer events)",
	grain !== null &&
		grain.size === "200px 200px" &&
		grain.opacity === "0.4" &&
		grain.zIndex === "50" &&
		grain.pointerEvents === "none",
	JSON.stringify(grain),
);

const imgs = page.locator("[data-role] img");
check("Carousel renders 4 images", (await imgs.count()) === 4);
const naturalSizes = await imgs.evaluateAll((els) =>
	els.map((el) => el.naturalWidth),
);
check(
	"All 4 remote figurine images loaded",
	naturalSizes.every((w) => w > 0),
	`naturalWidths=${naturalSizes.join(",")}`,
);

// --- Role geometry (desktop) ---
async function roleSnapshot() {
	return page.evaluate(() => {
		const out = {};
		document.querySelectorAll("[data-role]").forEach((el, i) => {
			const cs = getComputedStyle(el);
			out[el.dataset.role] = {
				index: i,
				transform: cs.transform,
				filter: cs.filter,
				opacity: cs.opacity,
				zIndex: cs.zIndex,
				left: cs.left,
				// offsetHeight is the layout height, unaffected by the scale() transform
				heightPct:
					Math.round((el.offsetHeight / window.innerHeight) * 1000) / 10,
			};
		});
		return out;
	});
}

let roles = await roleSnapshot();
check(
	"Initial roles: center=item0, right=item1, back=item2, left=item3",
	roles.center?.index === 0 &&
		roles.right?.index === 1 &&
		roles.back?.index === 2 &&
		roles.left?.index === 3,
	JSON.stringify(
		Object.fromEntries(Object.entries(roles).map(([k, v]) => [k, v.index])),
	),
);

const centerScale = roles.center
	? Number(roles.center.transform.match(/matrix\(([-\d.]+)/)?.[1])
	: NaN;
check(
	"Desktop center: scale 1.68, no blur, z-20, left 50%, height 92vh",
	Math.abs(centerScale - 1.68) < 0.01 &&
		roles.center.filter === "none" &&
		roles.center.zIndex === "20" &&
		roles.center.left === "640px" &&
		Math.abs(roles.center.heightPct - 92) < 1,
	JSON.stringify(roles.center),
);
check(
	"Desktop left: blur 2px, opacity 0.85, z-10, left 30%, height 28vh",
	roles.left.filter === "blur(2px)" &&
		roles.left.opacity === "0.85" &&
		roles.left.zIndex === "10" &&
		roles.left.left === "384px" &&
		Math.abs(roles.left.heightPct - 28) < 1,
	JSON.stringify(roles.left),
);
check(
	"Desktop right: blur 2px, opacity 0.85, z-10, left 70%",
	roles.right.filter === "blur(2px)" &&
		roles.right.opacity === "0.85" &&
		roles.right.zIndex === "10" &&
		roles.right.left === "896px",
	JSON.stringify(roles.right),
);
check(
	"Desktop back: blur 4px, opacity 1, z-5, left 50%, height 22vh",
	roles.back.filter === "blur(4px)" &&
		roles.back.opacity === "1" &&
		roles.back.zIndex === "5" &&
		roles.back.left === "640px" &&
		Math.abs(roles.back.heightPct - 22) < 1,
	JSON.stringify(roles.back),
);

const itemTransition = await page
	.locator('[data-role="center"]')
	.evaluate(
		(el) =>
			getComputedStyle(el).transitionProperty +
			" | " +
			getComputedStyle(el).transitionDuration,
	);
check(
	"Carousel item transitions transform/filter/opacity/left over 0.65s",
	itemTransition ===
		"transform, filter, opacity, left | 0.65s, 0.65s, 0.65s, 0.65s",
	itemTransition,
);

// --- Background + navigation ---
const outer = page.locator("#root > div");
const bg0 = await outer.evaluate((el) => getComputedStyle(el).backgroundColor);
check("Initial background is #F4845F", bg0 === EXPECTED_BGS[0], bg0);
const bgTransition = await outer.evaluate((el) => {
	const cs = getComputedStyle(el);
	return `${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`;
});
check(
	"Background transition 650ms cubic-bezier(0.4,0,0.2,1)",
	bgTransition === "background-color 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
	bgTransition,
);

const nextBtn = page.getByRole("button", { name: "Next figurine" });
const prevBtn = page.getByRole("button", { name: "Previous figurine" });

// Full cycle forward: 1 -> 2 -> 3 -> 0
for (let step = 1; step <= 4; step += 1) {
	await nextBtn.click();
	await page.waitForTimeout(750);
	const bg = await outer.evaluate((el) => getComputedStyle(el).backgroundColor);
	const expected = EXPECTED_BGS[step % 4];
	check(
		`Next click #${step}: background settles to ${expected}`,
		bg === expected,
		bg,
	);
}
roles = await roleSnapshot();
check(
	"After full forward cycle, item 0 is center again",
	roles.center?.index === 0,
);

// Prev: 0 -> 3
await prevBtn.click();
await page.waitForTimeout(750);
roles = await roleSnapshot();
const bgPrev = await outer.evaluate(
	(el) => getComputedStyle(el).backgroundColor,
);
check(
	"Prev click: activeIndex wraps to 3",
	roles.center?.index === 3 && bgPrev === EXPECTED_BGS[3],
	bgPrev,
);

// Animation lock: two rapid clicks should advance only once
await nextBtn.click();
await nextBtn.click(); // should be ignored (within 650ms lock)
await page.waitForTimeout(750);
roles = await roleSnapshot();
check(
	"Animation lock: double-click advances one step only (3 -> 0)",
	roles.center?.index === 0,
	`center=${roles.center?.index}`,
);

// Buttons styling (move pointer away first so hover state does not apply)
await page.mouse.move(0, 0);
await page.waitForTimeout(250);
const btnStyle = await nextBtn.evaluate((el) => {
	const cs = getComputedStyle(el);
	return {
		radius: cs.borderRadius,
		border: `${cs.borderWidth} ${cs.borderColor}`,
		w: cs.width,
		h: cs.height,
		bg: cs.backgroundColor,
	};
});
check(
	"Nav buttons: 64px circle, 2px white border, transparent bg",
	btnStyle.w === "64px" &&
		btnStyle.h === "64px" &&
		btnStyle.border === "2px rgb(255, 255, 255)" &&
		btnStyle.bg === "rgba(0, 0, 0, 0)" &&
		parseFloat(btnStyle.radius) >= 32,
	JSON.stringify(btnStyle),
);

// Hover state on nav button
await nextBtn.hover();
await page.waitForTimeout(250);
const hoverStyle = await nextBtn.evaluate((el) => {
	const cs = getComputedStyle(el);
	return { bg: cs.backgroundColor, transform: cs.transform };
});
check(
	"Nav button hover: scale 1.08 + rgba(255,255,255,0.12) bg",
	hoverStyle.bg === "rgba(255, 255, 255, 0.12)" &&
		hoverStyle.transform.startsWith("matrix(1.08"),
	JSON.stringify(hoverStyle),
);

// --- Mobile layout (< 640px) ---
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(750);
roles = await roleSnapshot();
const mobileScale = roles.center
	? Number(roles.center.transform.match(/matrix\(([-\d.]+)/)?.[1])
	: NaN;
check(
	"Mobile center: scale 1.25, height 60vh",
	Math.abs(mobileScale - 1.25) < 0.01 &&
		Math.abs(roles.center.heightPct - 60) < 1,
	JSON.stringify({ scale: mobileScale, heightPct: roles.center?.heightPct }),
);
check(
	"Mobile left/right flank at 20% / 80%",
	roles.left.left === "78px" && roles.right.left === "312px",
	JSON.stringify({ left: roles.left.left, right: roles.right.left }),
);
const testimonialVisible = await page
	.getByText("The artwork is stunning", { exact: false })
	.isVisible();
check("Testimonial hidden on mobile", !testimonialVisible);

check(
	"No console or page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | "),
);

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
