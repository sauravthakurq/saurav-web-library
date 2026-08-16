/**
 * Generates the four PNG assets for the landing page by rendering HTML/SVG
 * in headless Chromium (Playwright) and screenshotting — CLI only, no GUI.
 *
 *   logo.png                — white tile + black analytics pulse mark
 *   hero-dashboard.png      — full dark analytics dashboard mock (16:10)
 *   quote-symbol.png        — white Instrument Serif opening quote mark
 *   testimonial-avatar.png  — flat-illustration headshot on gradient
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src", "assets");
const tmpDir = path.join(root, "scripts", ".tmp-assets");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const interFiles = path.join(
	root,
	"node_modules",
	"@fontsource",
	"inter",
	"files",
);
const serifFiles = path.join(
	root,
	"node_modules",
	"@fontsource",
	"instrument-serif",
	"files",
);

const fontFaces = `
  @font-face {
    font-family: "Inter";
    font-weight: 400;
    src: url("${pathToFileURL(path.join(interFiles, "inter-latin-400-normal.woff2"))}") format("woff2");
  }
  @font-face {
    font-family: "Inter";
    font-weight: 500;
    src: url("${pathToFileURL(path.join(interFiles, "inter-latin-500-normal.woff2"))}") format("woff2");
  }
  @font-face {
    font-family: "Inter";
    font-weight: 600;
    src: url("${pathToFileURL(path.join(interFiles, "inter-latin-600-normal.woff2"))}") format("woff2");
  }
  @font-face {
    font-family: "Inter";
    font-weight: 700;
    src: url("${pathToFileURL(path.join(interFiles, "inter-latin-700-normal.woff2"))}") format("woff2");
  }
  @font-face {
    font-family: "Instrument Serif";
    font-weight: 400;
    src: url("${pathToFileURL(path.join(serifFiles, "instrument-serif-latin-400-normal.woff2"))}") format("woff2");
  }
`;

/* ---------------------------------- logo --------------------------------- */

const logoMark = (size, tile, line) => `
  <svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="240" height="240" rx="60" fill="${tile}"/>
    <path d="M52 164 L92 164 L114 84 L142 196 L164 124 L204 124"
      stroke="${line}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="52" cy="164" r="13" fill="${line}"/>
    <circle cx="204" cy="124" r="13" fill="${line}"/>
  </svg>`;

const logoHtml = `<!doctype html><html><head><style>
  html,body{margin:0;background:transparent}
</style></head><body>
  <div id="shot" style="width:256px;height:256px">${logoMark(256, "#ffffff", "#000000")}</div>
</body></html>`;

/* ----------------------------- quote symbol ------------------------------ */
// Draws the “ glyph in Instrument Serif onto a transparent canvas, scaled to
// its ink bounding box so the exported PNG is tightly cropped.

const quoteHtml = `<!doctype html><html><head><style>
  ${fontFaces}
  html,body{margin:0;background:transparent}
  canvas{display:block}
</style></head><body>
  <canvas id="shot" width="560" height="400"></canvas>
  <script>
    async function draw() {
      await document.fonts.load('400px "Instrument Serif"');
      await document.fonts.ready;
      const c = document.getElementById("shot");
      const ctx = c.getContext("2d");
      const probe = 400;
      ctx.font = probe + 'px "Instrument Serif"';
      const m = ctx.measureText("\\u201C");
      const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const scale = Math.min(c.width / inkW, c.height / inkH);
      const size = probe * scale;
      ctx.font = size + 'px "Instrument Serif"';
      const m2 = ctx.measureText("\\u201C");
      const w = m2.actualBoundingBoxLeft + m2.actualBoundingBoxRight;
      const h = m2.actualBoundingBoxAscent + m2.actualBoundingBoxDescent;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        "\\u201C",
        m2.actualBoundingBoxLeft + (c.width - w) / 2,
        m2.actualBoundingBoxAscent + (c.height - h) / 2,
      );
      document.title = "done";
    }
    draw();
  </script>
</body></html>`;

/* ------------------------------- avatar ---------------------------------- */

const avatarHtml = `<!doctype html><html><head><style>
  html,body{margin:0;background:transparent}
</style></head><body>
  <div id="shot" style="width:512px;height:512px">
    <svg width="512" height="512" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#9eb7a4"/>
          <stop offset="1" stop-color="#5c7d68"/>
        </linearGradient>
        <linearGradient id="tee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f6f2e9"/>
          <stop offset="1" stop-color="#e3ddcf"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" fill="url(#bg)"/>
      <!-- back hair -->
      <path d="M128 34 c-37 0 -56 26 -56 62 c0 34 6 58 2 84 l108 0 c-4 -26 2 -50 2 -84 c0 -36 -19 -62 -56 -62 z" fill="#2e211c"/>
      <!-- shoulders / tee -->
      <path d="M128 168 c-42 0 -74 26 -82 88 l164 0 c-8 -62 -40 -88 -82 -88 z" fill="url(#tee)"/>
      <!-- neck -->
      <path d="M112 132 h32 v34 c0 10 -7 16 -16 16 s-16 -6 -16 -16 z" fill="#d79d6e"/>
      <path d="M112 138 c5 6 11 9 16 9 s11 -3 16 -9 v-6 h-32 z" fill="#c08a5d"/>
      <!-- face -->
      <ellipse cx="128" cy="98" rx="42" ry="46" fill="#e9b888"/>
      <!-- ears -->
      <circle cx="86" cy="102" r="9" fill="#e9b888"/>
      <circle cx="170" cy="102" r="9" fill="#e9b888"/>
      <!-- front hair -->
      <path d="M128 40 c-30 0 -46 20 -46 48 c0 6 1 12 3 17 c2 -22 12 -33 24 -36 c14 -4 26 -4 38 0 c12 3 22 14 24 36 c2 -5 3 -11 3 -17 c0 -28 -16 -48 -46 -48 z" fill="#3a2a22"/>
      <!-- brows -->
      <path d="M106 92 q8 -5 16 -2" stroke="#3a2a22" stroke-width="3.4" stroke-linecap="round" fill="none"/>
      <path d="M134 90 q8 -3 16 2" stroke="#3a2a22" stroke-width="3.4" stroke-linecap="round" fill="none"/>
      <!-- eyes -->
      <circle cx="113" cy="102" r="3.6" fill="#241a15"/>
      <circle cx="143" cy="102" r="3.6" fill="#241a15"/>
      <!-- nose -->
      <path d="M128 104 q-3 8 0 12" stroke="#c08a5d" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <!-- smile -->
      <path d="M118 124 q10 8 20 0" stroke="#a8643c" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <!-- blush -->
      <circle cx="104" cy="114" r="5.5" fill="#dd9a6a" opacity="0.55"/>
      <circle cx="152" cy="114" r="5.5" fill="#dd9a6a" opacity="0.55"/>
      <!-- earrings -->
      <circle cx="86" cy="112" r="2.6" fill="#f3cf6d"/>
      <circle cx="170" cy="112" r="2.6" fill="#f3cf6d"/>
    </svg>
  </div>
</body></html>`;

/* ------------------------------ dashboard -------------------------------- */

const spark = (points, stroke, id) => `
  <svg viewBox="0 0 120 36" preserveAspectRatio="none" style="width:100%;height:36px;display:block">
    <defs>
      <linearGradient id="sg${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${stroke}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${stroke}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M${points} L120,36 L0,36 Z" fill="url(#sg${id})"/>
    <path d="M${points}" fill="none" stroke="${stroke}" stroke-width="2"/>
  </svg>`;

const kpi = (label, value, delta, up, sparkSvg) => `
  <div class="card kpi">
    <div class="kpi-top">
      <span class="kpi-label">${label}</span>
      <span class="delta ${up ? "up" : "down"}">${up ? "&#9650;" : "&#9660;"} ${delta}</span>
    </div>
    <div class="kpi-value">${value}</div>
    ${sparkSvg}
  </div>`;

const dashboardHtml = `<!doctype html><html><head><style>
  ${fontFaces}
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { background:#000; }
  #shot {
    width:1440px; height:900px; background:#070708;
    font-family:"Inter",system-ui,sans-serif; color:#fafafa;
    display:grid; grid-template-columns:248px 1fr; overflow:hidden;
    border:1px solid #232325;
  }
  .sidebar { background:#0a0a0b; border-right:1px solid #1c1c1f; padding:28px 20px; display:flex; flex-direction:column; gap:28px; }
  .brand { display:flex; align-items:center; gap:10px; font-weight:700; font-size:19px; letter-spacing:-0.4px; }
  .nav { display:flex; flex-direction:column; gap:4px; }
  .nav a { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:10px; color:#8b8b92; font-size:13.5px; font-weight:500; text-decoration:none; }
  .nav a.active { background:#19191c; color:#fff; }
  .nav .dot { width:7px; height:7px; border-radius:99px; background:currentColor; opacity:0.7; }
  .up-card { margin-top:auto; background:linear-gradient(160deg,#1b1b1f,#101012); border:1px solid #26262a; border-radius:14px; padding:16px; }
  .up-card b { font-size:13.5px; display:block; margin-bottom:5px; }
  .up-card p { font-size:11.5px; color:#8b8b92; line-height:1.45; margin-bottom:12px; }
  .up-card .btn { display:block; text-align:center; background:#fff; color:#000; border-radius:9px; padding:8px 0; font-size:12px; font-weight:600; }
  .main { padding:26px 30px; display:flex; flex-direction:column; gap:20px; min-width:0; }
  .topbar { display:flex; align-items:center; justify-content:space-between; }
  .topbar h1 { font-size:22px; font-weight:600; letter-spacing:-0.5px; }
  .topbar .sub { color:#8b8b92; font-size:12.5px; margin-top:3px; font-weight:400; }
  .top-right { display:flex; align-items:center; gap:12px; }
  .chip { background:#121214; border:1px solid #232327; color:#c9c9cf; font-size:12.5px; border-radius:10px; padding:9px 14px; display:flex; align-items:center; gap:8px; }
  .avatar { width:36px; height:36px; border-radius:99px; background:linear-gradient(140deg,#e9b888,#9eb7a4); border:2px solid #2c2c30; }
  .card { background:#0e0e10; border:1px solid #1e1e22; border-radius:16px; }
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .kpi { padding:18px 18px 12px; }
  .kpi-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .kpi-label { color:#8b8b92; font-size:12.5px; font-weight:500; }
  .delta { font-size:11px; font-weight:600; border-radius:99px; padding:3px 8px; }
  .delta.up { color:#4ade80; background:rgba(74,222,128,0.09); }
  .delta.down { color:#f87171; background:rgba(248,113,113,0.09); }
  .kpi-value { font-size:26px; font-weight:600; letter-spacing:-0.6px; margin-bottom:12px; }
  .grid-mid { display:grid; grid-template-columns:1fr 340px; gap:16px; flex:1; min-height:0; }
  .chart-card { padding:20px 22px; display:flex; flex-direction:column; }
  .card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .card-head b { font-size:14.5px; font-weight:600; }
  .legend { display:flex; gap:14px; color:#8b8b92; font-size:11.5px; }
  .legend i { width:8px; height:8px; border-radius:2px; display:inline-block; margin-right:6px; }
  .right-col { display:flex; flex-direction:column; gap:16px; min-height:0; }
  .goal { padding:20px 22px; display:flex; flex-direction:column; align-items:center; gap:6px; }
  .goal .ring-label { font-size:24px; font-weight:600; }
  .goal .ring-sub { color:#8b8b92; font-size:12px; }
  .channels { padding:20px 22px; flex:1; }
  .ch-row { display:flex; align-items:center; gap:12px; margin-top:13px; }
  .ch-row span { width:78px; color:#8b8b92; font-size:12px; }
  .bar { flex:1; height:8px; background:#1a1a1e; border-radius:99px; overflow:hidden; }
  .bar i { display:block; height:100%; border-radius:99px; }
  .ch-row b { font-size:12px; font-weight:600; width:38px; text-align:right; }
</style></head><body>
<div id="shot">
  <aside class="sidebar">
    <div class="brand">${logoMark(28, "#ffffff", "#000000")} Neuralyn</div>
    <nav class="nav">
      <a class="active"><span class="dot"></span>Overview</a>
      <a><span class="dot"></span>Reports</a>
      <a><span class="dot"></span>Goals</a>
      <a><span class="dot"></span>Metrics</a>
      <a><span class="dot"></span>Teams</a>
      <a><span class="dot"></span>Settings</a>
    </nav>
    <div class="up-card">
      <b>Corewave v3.2</b>
      <p>Smarter forecasts and anomaly alerts are now live for your workspace.</p>
      <span class="btn">Explore what&#8217;s new</span>
    </div>
  </aside>
  <section class="main">
    <div class="topbar">
      <div>
        <h1>Overview</h1>
        <div class="sub">Tuesday, 9 June &#8212; all systems reporting</div>
      </div>
      <div class="top-right">
        <span class="chip">Last 30 days &#9662;</span>
        <span class="chip">&#8853; Add widget</span>
        <span class="avatar"></span>
      </div>
    </div>
    <div class="kpis">
      ${kpi("Monthly revenue", "$128,420", "12.4%", true, spark("0,28 14,24 28,26 42,18 56,20 70,12 84,15 98,8 112,10 120,4", "#7dd3fc", 1))}
      ${kpi("Active users", "48,210", "8.1%", true, spark("0,30 14,26 28,27 42,22 56,24 70,18 84,12 98,14 112,8 120,6", "#a5b4fc", 2))}
      ${kpi("Conversion rate", "3.42%", "0.6%", false, spark("0,12 14,16 28,14 42,20 56,18 70,24 84,22 98,26 112,24 120,28", "#fda4af", 3))}
      ${kpi("Avg. session", "4m 32s", "2.3%", true, spark("0,26 14,28 28,22 42,24 56,16 70,18 84,12 98,15 112,9 120,11", "#86efac", 4))}
    </div>
    <div class="grid-mid">
      <div class="card chart-card">
        <div class="card-head">
          <b>Revenue analytics</b>
          <div class="legend"><span><i style="background:#7dd3fc"></i>This year</span><span><i style="background:#3f3f46"></i>Last year</span></div>
        </div>
        <svg viewBox="0 0 760 320" preserveAspectRatio="none" style="flex:1;width:100%">
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#7dd3fc" stop-opacity="0.30"/>
              <stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <g stroke="#1c1c20" stroke-width="1">
            <line x1="0" y1="60" x2="760" y2="60"/><line x1="0" y1="120" x2="760" y2="120"/>
            <line x1="0" y1="180" x2="760" y2="180"/><line x1="0" y1="240" x2="760" y2="240"/>
          </g>
          <path d="M0,250 C60,235 95,255 150,240 C205,225 235,195 300,205 C365,215 390,160 450,150 C510,140 540,170 600,135 C660,100 700,115 760,80"
            fill="none" stroke="#3f3f46" stroke-width="2.5" stroke-dasharray="6 7"/>
          <path d="M0,235 C70,215 105,230 160,205 C215,180 250,190 310,165 C370,140 405,150 465,115 C525,80 560,105 620,70 C680,35 720,55 760,30 L760,320 L0,320 Z" fill="url(#area)"/>
          <path d="M0,235 C70,215 105,230 160,205 C215,180 250,190 310,165 C370,140 405,150 465,115 C525,80 560,105 620,70 C680,35 720,55 760,30"
            fill="none" stroke="#7dd3fc" stroke-width="3"/>
          <circle cx="620" cy="70" r="6" fill="#070708" stroke="#7dd3fc" stroke-width="3"/>
          <g fill="#6b6b72" font-size="12" font-family="Inter,system-ui">
            <text x="6" y="312">Jan</text><text x="130" y="312">Mar</text><text x="260" y="312">May</text>
            <text x="390" y="312">Jul</text><text x="520" y="312">Sep</text><text x="650" y="312">Nov</text>
          </g>
        </svg>
      </div>
      <div class="right-col">
        <div class="card goal">
          <div class="card-head" style="width:100%"><b>Quarterly goal</b></div>
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="62" fill="none" stroke="#1a1a1e" stroke-width="13"/>
            <circle cx="75" cy="75" r="62" fill="none" stroke="#7dd3fc" stroke-width="13"
              stroke-linecap="round" stroke-dasharray="389.5" stroke-dashoffset="93.5"
              transform="rotate(-90 75 75)"/>
            <text x="75" y="71" text-anchor="middle" fill="#fafafa" font-size="27" font-weight="600" font-family="Inter,system-ui">76%</text>
            <text x="75" y="92" text-anchor="middle" fill="#8b8b92" font-size="11" font-family="Inter,system-ui">of $160K target</text>
          </svg>
          <div class="ring-sub">On pace &#8212; 22 days remaining</div>
        </div>
        <div class="card channels">
          <div class="card-head"><b>Sessions by channel</b></div>
          <div class="ch-row"><span>Organic</span><div class="bar"><i style="width:82%;background:#7dd3fc"></i></div><b>42%</b></div>
          <div class="ch-row"><span>Direct</span><div class="bar"><i style="width:58%;background:#a5b4fc"></i></div><b>27%</b></div>
          <div class="ch-row"><span>Referral</span><div class="bar"><i style="width:38%;background:#86efac"></i></div><b>18%</b></div>
          <div class="ch-row"><span>Social</span><div class="bar"><i style="width:24%;background:#fda4af"></i></div><b>9%</b></div>
          <div class="ch-row"><span>Email</span><div class="bar"><i style="width:12%;background:#fde68a"></i></div><b>4%</b></div>
        </div>
      </div>
    </div>
  </section>
</div>
</body></html>`;

/* --------------------------------- run ----------------------------------- */

const jobs = [
	{ name: "logo.png", html: logoHtml, viewport: { width: 300, height: 300 } },
	{
		name: "quote-symbol.png",
		html: quoteHtml,
		viewport: { width: 600, height: 450 },
		waitTitle: "done",
	},
	{
		name: "testimonial-avatar.png",
		html: avatarHtml,
		viewport: { width: 560, height: 560 },
	},
	{
		name: "hero-dashboard.png",
		html: dashboardHtml,
		viewport: { width: 1480, height: 940 },
		scale: 2,
	},
];

const browser = await chromium.launch();
try {
	for (const job of jobs) {
		const file = path.join(tmpDir, job.name.replace(".png", ".html"));
		writeFileSync(file, job.html);
		const page = await browser.newPage({
			viewport: job.viewport,
			deviceScaleFactor: job.scale ?? 1,
		});
		await page.goto(pathToFileURL(file).href);
		await page.evaluate(() => document.fonts.ready);
		if (job.waitTitle) {
			await page.waitForFunction((t) => document.title === t, job.waitTitle, {
				timeout: 10_000,
			});
		}
		await page
			.locator("#shot")
			.screenshot({ path: path.join(outDir, job.name), omitBackground: true });
		await page.close();
		console.log(`generated ${job.name}`);
	}
} finally {
	await browser.close();
	rmSync(tmpDir, { recursive: true, force: true });
}
console.log("all assets written to src/assets/");
