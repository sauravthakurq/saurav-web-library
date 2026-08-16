/**
 * Headless E2E verification of the built app (run `npm run build` first).
 *
 * Serves dist/ via `vite preview`, intercepts the CloudFront video URL with a
 * local 4s fixture (scripts/fixtures/scrub-fixture.mp4) so video metadata,
 * scrubbing, and autoplay checks are deterministic and offline-safe, then
 * exercises desktop + mobile behavior with Playwright Chromium.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const FIXTURE = join(__dirname, "fixtures", "scrub-fixture.mp4");

const PORT = 4912;
const BASE_URL = `http://localhost:${PORT}/`;
const HEADLINE = "we'd love to\nhear from you!";

let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
	if (condition) {
		passed += 1;
		console.log(`PASS  ${name}`);
	} else {
		failed += 1;
		console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
	}
}

async function waitForServer(url, timeoutMs = 20000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			/* server not up yet */
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

const fixtureBytes = readFileSync(FIXTURE);

/**
 * Serve the fixture with proper byte-range semantics (Accept-Ranges + 206).
 * Without them Chromium marks the media source as non-seekable and clamps
 * every `currentTime` assignment back to 0, which would break scrub checks.
 */
function fulfillVideo(route) {
	const total = fixtureBytes.length;
	const range = route.request().headers().range;
	const match = range ? /bytes=(\d+)-(\d*)/.exec(range) : null;
	if (match) {
		const start = Number(match[1]);
		const end = match[2] ? Number(match[2]) : total - 1;
		const body = fixtureBytes.subarray(start, end + 1);
		return route.fulfill({
			status: 206,
			headers: {
				"content-type": "video/mp4",
				"accept-ranges": "bytes",
				"content-range": `bytes ${start}-${end}/${total}`,
				"content-length": String(body.length),
			},
			body,
		});
	}
	return route.fulfill({
		status: 200,
		headers: {
			"content-type": "video/mp4",
			"accept-ranges": "bytes",
			"content-length": String(total),
		},
		body: fixtureBytes,
	});
}

async function newPage(browser, viewport) {
	const page = await browser.newPage({ viewport });
	// Serve the background video from the local fixture.
	await page.route("**/*.mp4", fulfillVideo);
	await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
	const title = await page.title();
	if (!title.includes("Mainframe")) {
		throw new Error(
			`Port ${PORT} serves a different app (title: "${title}") — port collision?`,
		);
	}
	return page;
}

async function desktopChecks(browser) {
	console.log("\n--- Desktop (1440x900) ---");
	const page = await newPage(browser, { width: 1440, height: 900 });

	// Navbar.
	check(
		'logo text "Mainframe®"',
		(await page.locator("header a").first().innerText()).includes("Mainframe®"),
	);
	check(
		"logo asterisk ✱ present",
		(await page.locator("header").innerText()).includes("✱"),
	);
	for (const link of ["Labs", "Studio", "Openings", "Shop"]) {
		check(
			`nav link "${link}" visible`,
			await page.getByRole("link", { name: link, exact: true }).isVisible(),
		);
	}
	check(
		"comma dividers between nav links",
		(await page.locator('header nav[aria-label="Primary"]').innerText()).split(
			",",
		).length === 4,
	);
	check(
		'desktop CTA "Get in touch" visible',
		await page.locator("header > a", { hasText: "Get in touch" }).isVisible(),
	);
	check(
		"hamburger hidden on desktop",
		!(await page.locator("header button[aria-expanded]").isVisible()),
	);
	check(
		"header is fixed + z-10",
		await page.locator("header").evaluate((el) => {
			const cs = getComputedStyle(el);
			return cs.position === "fixed" && cs.zIndex === "10";
		}),
	);

	// Background video element + layout.
	const video = page.locator("video");
	check("video muted", await video.evaluate((v) => v.muted));
	check("video playsInline", await video.evaluate((v) => v.playsInline));
	check(
		'video preload="auto"',
		(await video.getAttribute("preload")) === "auto",
	);
	check(
		"video container absolutely positioned full-bleed on desktop",
		await video.evaluate((v) => {
			const cs = getComputedStyle(v.parentElement);
			return (
				cs.position === "absolute" &&
				cs.pointerEvents === "none" &&
				cs.zIndex === "0"
			);
		}),
	);
	check(
		"video object-cover",
		await video.evaluate((v) => getComputedStyle(v).objectFit === "cover"),
	);
	check(
		"no autoplay on desktop",
		await video.evaluate((v) => !v.autoplay && v.paused),
	);

	// Typewriter headline: cursor blinks while typing, full text + no cursor after.
	const cursorSeen = await page
		.waitForSelector("h1 .animate-blink", { timeout: 2500 })
		.then(() => true)
		.catch(() => false);
	check("typewriter cursor visible while typing", cursorSeen);
	const typed = await page
		.waitForFunction(
			(full) => document.querySelector("h1")?.textContent === full,
			HEADLINE,
			{ timeout: 6000 },
		)
		.then(() => true)
		.catch(() => false);
	check("typewriter completes full headline (with newline)", typed);
	check(
		"cursor removed when typing is done",
		(await page.locator("h1 .animate-blink").count()) === 0,
	);
	check(
		"headline preserves line break (whitespace-pre-wrap)",
		await page
			.locator("h1")
			.evaluate((el) => getComputedStyle(el).whiteSpace === "pre-wrap"),
	);

	// Secondary description.
	check(
		"description text present",
		(await page.locator("main p").first().innerText()).includes(
			"drop us a message",
		),
	);

	// Service pills.
	check(
		'title "What sort of service?"',
		await page.getByText("What sort of service?").isVisible(),
	);
	check(
		'subtitle "Select all that apply"',
		await page.getByText("Select all that apply").isVisible(),
	);
	const pills = page.locator("button[aria-pressed]");
	check("four service pills rendered", (await pills.count()) === 4);
	check(
		"placeholder shown when nothing selected",
		await page.getByText("Please click to select services above.").isVisible(),
	);

	const brand = page.getByRole("button", { name: "Brand" });
	await brand.click();
	check(
		"pill toggles active (aria-pressed)",
		(await brand.getAttribute("aria-pressed")) === "true",
	);
	check(
		"active pill gets dark fill class",
		((await brand.getAttribute("class")) ?? "").includes("bg-[#1C2E1E]"),
	);
	const checkIcon = await page
		.waitForSelector('button[aria-pressed="true"] svg.lucide-check', {
			timeout: 2000,
		})
		.then(() => true)
		.catch(() => false);
	check("check icon springs in on active pill", checkIcon);

	await page.getByRole("button", { name: "Digital" }).click();
	const banner = await page
		.waitForSelector("text=Ready to inquire about: Brand, Digital", {
			timeout: 3000,
		})
		.then(() => true)
		.catch(() => false);
	check('banner lists selection "Brand, Digital"', banner);
	check(
		'banner CTA "Let\'s Go" visible',
		await page.getByRole("button", { name: /Let's Go/i }).isVisible(),
	);

	await brand.click();
	await page.getByRole("button", { name: "Digital" }).click();
	const placeholderBack = await page
		.waitForSelector("text=Please click to select services above.", {
			timeout: 3000,
		})
		.then(() => true)
		.catch(() => false);
	check("placeholder returns after deselecting all", placeholderBack);

	// Mouse scrubbing: sweeping the cursor right advances video.currentTime.
	const hasDuration = await page
		.waitForFunction(
			() => {
				const v = document.querySelector("video");
				return Boolean(v && v.duration > 0);
			},
			{ timeout: 10000 },
		)
		.then(() => true)
		.catch(() => false);
	check("video metadata (duration) loaded from fixture", hasDuration);

	if (hasDuration) {
		const before = await video.evaluate((v) => v.currentTime);
		await page.mouse.move(100, 450);
		for (let x = 100; x <= 1340; x += 40) {
			await page.mouse.move(x, 450);
			await page.waitForTimeout(10);
		}
		await page.waitForTimeout(400);
		const after = await video.evaluate((v) => v.currentTime);
		check(
			"mouse sweep scrubs video forward",
			after > before + 0.4,
			`currentTime ${before.toFixed(3)} -> ${after.toFixed(3)}`,
		);

		// Sweep back left: time decreases and clamps at >= 0.
		for (let x = 1340; x >= 60; x -= 40) {
			await page.mouse.move(x, 450);
			await page.waitForTimeout(10);
		}
		await page.waitForTimeout(400);
		const rewound = await video.evaluate((v) => v.currentTime);
		check(
			"reverse sweep rewinds and clamps at 0",
			rewound < after && rewound >= 0,
			`currentTime ${after.toFixed(3)} -> ${rewound.toFixed(3)}`,
		);
		check(
			"video still paused while scrubbing",
			await video.evaluate((v) => v.paused),
		);
	}

	await page.close();
}

async function mobileChecks(browser) {
	console.log("\n--- Mobile (390x844) ---");
	const page = await newPage(browser, { width: 390, height: 844 });

	// Navbar collapses to hamburger.
	const burger = page.locator("header button[aria-expanded]");
	check("hamburger visible on mobile", await burger.isVisible());
	check(
		"desktop nav hidden on mobile",
		!(await page.locator('header nav[aria-label="Primary"]').isVisible()),
	);
	check(
		"desktop CTA hidden on mobile",
		!(await page
			.locator("header > a", { hasText: "Get in touch" })
			.isVisible()),
	);

	// Overlay toggling.
	const overlay = page.locator('[data-testid="mobile-overlay"]');
	check(
		"overlay starts hidden (opacity 0, no pointer events)",
		await overlay.evaluate((el) => {
			const cs = getComputedStyle(el);
			return cs.pointerEvents === "none" && Number(cs.opacity) === 0;
		}),
	);
	await burger.click();
	check(
		"burger aria-expanded true after tap",
		(await burger.getAttribute("aria-expanded")) === "true",
	);
	check(
		"burger morphs into X (rotate classes applied)",
		await burger.evaluate((btn) => {
			const [top, mid, bottom] = btn.querySelectorAll("span");
			return (
				top.className.includes("rotate-45") &&
				mid.className.includes("opacity-0") &&
				bottom.className.includes("-rotate-45")
			);
		}),
	);
	await page.waitForTimeout(400); // let the 300ms opacity transition finish
	check(
		"overlay open (opacity 1, pointer events auto, z-9, blur)",
		await overlay.evaluate((el) => {
			const cs = getComputedStyle(el);
			return (
				cs.pointerEvents === "auto" &&
				Number(cs.opacity) === 1 &&
				cs.zIndex === "9" &&
				cs.position === "fixed"
			);
		}),
	);
	check(
		"overlay nav links visible",
		await page
			.locator('nav[aria-label="Mobile"] a', { hasText: "Labs" })
			.isVisible(),
	);
	await page.locator('nav[aria-label="Mobile"] a', { hasText: "Labs" }).click();
	await page.waitForTimeout(400);
	check(
		"tapping a link closes the overlay",
		await overlay.evaluate((el) => Number(getComputedStyle(el).opacity) === 0),
	);

	// Video: stacked below content, square, autoplaying.
	const video = page.locator("video");
	check(
		"video container in normal flow (not absolute) on mobile",
		await video.evaluate(
			(v) => getComputedStyle(v.parentElement).position === "relative",
		),
	);
	check(
		"video container is square on mobile",
		await video.evaluate((v) => {
			const r = v.parentElement.getBoundingClientRect();
			return Math.abs(r.width - r.height) < 2;
		}),
	);
	check(
		"content layer precedes video (order-first)",
		await page.evaluate(() => {
			const content = document.querySelector("main")?.parentElement;
			const videoBox = document.querySelector("video")?.parentElement;
			return Boolean(
				content &&
					videoBox &&
					getComputedStyle(content).order === "-9999" &&
					content.getBoundingClientRect().top <
						videoBox.getBoundingClientRect().top,
			);
		}),
	);
	check(
		"mobile autoplay flag set by hook",
		await video.evaluate((v) => v.autoplay),
	);
	const playing = await page
		.waitForFunction(
			() => {
				const v = document.querySelector("video");
				return Boolean(v && !v.paused && v.currentTime > 0);
			},
			{ timeout: 8000 },
		)
		.then(() => true)
		.catch(() => false);
	check("video actually playing on mobile", playing);

	await page.close();
}

async function main() {
	const preview = spawn(
		"npm",
		["run", "preview", "--", "--port", String(PORT), "--strictPort"],
		{ cwd: PROJECT_ROOT, stdio: "ignore", detached: true },
	);

	let browser;
	try {
		await waitForServer(BASE_URL);
		browser = await chromium.launch();
		await desktopChecks(browser);
		await mobileChecks(browser);
	} finally {
		if (browser) await browser.close();
		try {
			process.kill(-preview.pid, "SIGTERM");
		} catch {
			preview.kill("SIGTERM");
		}
	}

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
