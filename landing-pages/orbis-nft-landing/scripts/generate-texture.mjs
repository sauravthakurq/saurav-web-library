/**
 * Generates public/texture.png — a grayscale film-grain texture with sparse
 * star specks, used by the full-screen overlay (mix-blend-mode: lighten).
 * Pure Node implementation: hand-assembled PNG chunks + zlib deflate.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const SIZE = 1024;

const CRC_TABLE = new Int32Array(256).map((_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c;
});

function crc32(buf) {
	let c = 0xffffffff;
	for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const out = Buffer.alloc(12 + data.length);
	out.writeUInt32BE(data.length, 0);
	out.write(type, 4, "ascii");
	data.copy(out, 8);
	out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
	return out;
}

// Raw image: one filter byte (0 = None) per scanline + grayscale pixels.
const raw = Buffer.alloc(SIZE * (SIZE + 1));
let offset = 0;
for (let y = 0; y < SIZE; y++) {
	raw[offset++] = 0;
	for (let x = 0; x < SIZE; x++) {
		// Soft grain: dark base noise so "lighten" blending stays subtle.
		let v = Math.random() * 46;
		// Sparse star specks (~0.05% of pixels).
		if (Math.random() < 0.0005) v = 110 + Math.random() * 145;
		raw[offset++] = Math.round(v);
	}
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); // width
ihdr.writeUInt32BE(SIZE, 4); // height
ihdr[8] = 8; // bit depth
ihdr[9] = 0; // color type: grayscale
// compression, filter, interlace all 0

const png = Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	chunk("IHDR", ihdr),
	chunk("IDAT", deflateSync(raw, { level: 9 })),
	chunk("IEND", Buffer.alloc(0)),
]);

const outPath = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"public",
	"texture.png",
);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${png.length} bytes, ${SIZE}x${SIZE})`);
