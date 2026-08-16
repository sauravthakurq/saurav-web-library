/**
 * Generates the monochrome PNG assets used by the landing page:
 *   - 3 abstract grayscale avatars (avatar-1..3.png, 128px)
 *   - 3 platform icons (icon-chatgpt/perplexity/google.png, 400px for 2x of 200px)
 * Run with: npm run assets
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { siGoogle, siOpenai, siPerplexity } from "simple-icons";

const outDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	"../src/assets",
);

/** Abstract monochrome avatar art — each a distinct generative composition. */
const avatarSvgs = [
	// 1: concentric ripples
	`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs>
      <radialGradient id="g" cx="35%" cy="30%" r="90%">
        <stop offset="0%" stop-color="#3d3d3d"/><stop offset="100%" stop-color="#121212"/>
      </radialGradient>
      <clipPath id="c"><circle cx="64" cy="64" r="64"/></clipPath>
    </defs>
    <g clip-path="url(#c)">
      <rect width="128" height="128" fill="url(#g)"/>
      <circle cx="88" cy="44" r="14" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="5"/>
      <circle cx="88" cy="44" r="30" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="3"/>
      <circle cx="88" cy="44" r="48" fill="none" stroke="#fff" stroke-opacity="0.2" stroke-width="2"/>
      <circle cx="88" cy="44" r="68" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="2"/>
    </g>
  </svg>`,
	// 2: diagonal strata
	`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2b2b2b"/><stop offset="100%" stop-color="#0a0a0a"/>
      </linearGradient>
      <clipPath id="c"><circle cx="64" cy="64" r="64"/></clipPath>
    </defs>
    <g clip-path="url(#c)">
      <rect width="128" height="128" fill="url(#g)"/>
      <g transform="rotate(-24 64 64)" stroke="#fff" stroke-linecap="round">
        <line x1="-10" y1="34" x2="138" y2="34" stroke-width="9" stroke-opacity="0.85"/>
        <line x1="-10" y1="58" x2="138" y2="58" stroke-width="6" stroke-opacity="0.5"/>
        <line x1="-10" y1="78" x2="138" y2="78" stroke-width="4" stroke-opacity="0.28"/>
        <line x1="-10" y1="96" x2="138" y2="96" stroke-width="2.5" stroke-opacity="0.14"/>
      </g>
    </g>
  </svg>`,
	// 3: crescent eclipse
	`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <defs>
      <radialGradient id="g" cx="70%" cy="75%" r="95%">
        <stop offset="0%" stop-color="#383838"/><stop offset="100%" stop-color="#0e0e0e"/>
      </radialGradient>
      <clipPath id="c"><circle cx="64" cy="64" r="64"/></clipPath>
    </defs>
    <g clip-path="url(#c)">
      <rect width="128" height="128" fill="url(#g)"/>
      <circle cx="54" cy="58" r="34" fill="#f2f2f2"/>
      <circle cx="68" cy="48" r="34" fill="#181818"/>
      <circle cx="94" cy="98" r="7" fill="#fff" fill-opacity="0.8"/>
    </g>
  </svg>`,
];

/** Platform icon: white brand mark centered in a faint glass squircle. */
function iconSvg(iconPath, scale = 0.46) {
	const size = 400;
	const markSize = size * scale;
	const offset = (size - markSize) / 2;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect x="6" y="6" width="${size - 12}" height="${size - 12}" rx="92"
      fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2"/>
    <g transform="translate(${offset} ${offset}) scale(${markSize / 24})">
      <path d="${iconPath}" fill="#ffffff" fill-opacity="0.92"/>
    </g>
  </svg>`;
}

const jobs = [
	...avatarSvgs.map((svg, i) => ({ name: `avatar-${i + 1}.png`, svg })),
	{ name: "icon-chatgpt.png", svg: iconSvg(siOpenai.path) },
	{ name: "icon-perplexity.png", svg: iconSvg(siPerplexity.path) },
	{ name: "icon-google.png", svg: iconSvg(siGoogle.path) },
];

await mkdir(outDir, { recursive: true });
for (const { name, svg } of jobs) {
	const png = await sharp(Buffer.from(svg)).png().toBuffer();
	await writeFile(path.join(outDir, name), png);
	console.log(`wrote ${name} (${png.length} bytes)`);
}
