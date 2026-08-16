import { useEffect, useRef } from "react";

interface StarFieldProps {
	count?: number;
	className?: string;
	ring?: boolean;
	ringCount?: number;
	ringRadiusFactor?: number;
	ringBandWidth?: number;
}

interface Star {
	x: number;
	y: number;
	r: number;
	opacity: number;
	twinkleSpeed: number;
	twinkleOffset: number;
}

interface RingStar extends Star {
	radiusOffset: number;
}

/** Box-Muller transform -> standard normal sample scaled by `sd`. */
function gaussian(sd: number): number {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randomBg() {
	const roll = Math.random();
	let r: number;
	if (roll < 0.65) r = 0.25 + Math.random() * 0.25;
	else if (roll < 0.92) r = 0.5 + Math.random() * 0.3;
	else r = 0.8 + Math.random() * 0.5;
	return r;
}

function randomRingRadius() {
	const roll = Math.random();
	if (roll < 0.7) return 0.15 + Math.random() * 0.15;
	if (roll < 0.93) return 0.3 + Math.random() * 0.2;
	return 0.5 + Math.random() * 0.2;
}

export default function StarField({
	count = 600,
	className = "absolute inset-0 pointer-events-none",
	ring = false,
	ringCount = 240,
	ringRadiusFactor = 0.36,
	ringBandWidth = 52,
}: StarFieldProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = 0;
		let height = 0;
		let bgStars: Star[] = [];
		let ringStars: RingStar[] = [];
		let ringR = 0;
		let cx = 0;
		let cy = 0;

		const buildStars = () => {
			bgStars = [];
			for (let i = 0; i < count; i++) {
				bgStars.push({
					x: Math.random() * width,
					y: Math.random() * height,
					r: randomBg(),
					opacity: 0.2 + Math.random() * 0.75,
					twinkleSpeed: 0.4 + Math.random() * 1.2,
					twinkleOffset: Math.random() * Math.PI * 2,
				});
			}

			ringStars = [];
			if (ring) {
				cx = width / 2;
				cy = height / 2;
				ringR = Math.min(width, height) * ringRadiusFactor;
				const half = ringBandWidth / 2;
				const total = ringCount * 2;
				for (let i = 0; i < total; i++) {
					const angle = Math.random() * Math.PI * 2;
					const offset = gaussian(half * 0.65);
					const dist = ringR + offset;
					ringStars.push({
						x: cx + Math.cos(angle) * dist,
						y: cy + Math.sin(angle) * dist,
						r: randomRingRadius(),
						opacity: 0.25 + Math.random() * 0.55,
						twinkleSpeed: 0.3 + Math.random() * 1.0,
						twinkleOffset: Math.random() * Math.PI * 2,
						radiusOffset: offset,
					});
				}
			}
		};

		const dpr = Math.max(1, window.devicePixelRatio || 1);

		const resize = () => {
			const rect = parent.getBoundingClientRect();
			width = Math.max(1, rect.width);
			height = Math.max(1, rect.height);
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			buildStars();
		};

		const ro = new ResizeObserver(resize);
		ro.observe(parent);
		resize();

		let raf = 0;
		const start = performance.now();

		const draw = (now: number) => {
			const t = (now - start) / 1000;
			ctx.clearRect(0, 0, width, height);

			// Background stars.
			for (const s of bgStars) {
				const twinkle =
					0.55 +
					0.45 * (Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5);
				const alpha = s.opacity * twinkle;
				if (s.r > 1.1) {
					const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
					grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.3})`);
					grad.addColorStop(1, "rgba(255,255,255,0)");
					ctx.fillStyle = grad;
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.fillStyle = `rgba(255,255,255,${alpha})`;
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
				ctx.fill();
			}

			// Ring halo + ring stars.
			if (ring && ringStars.length) {
				const inner = Math.max(0, ringR - ringBandWidth * 4);
				const outer = ringR + ringBandWidth * 4;
				const halo = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
				halo.addColorStop(0, "rgba(255,255,255,0)");
				halo.addColorStop(0.42, "rgba(255,255,255,0.022)");
				halo.addColorStop(0.5, "rgba(255,255,255,0.038)");
				halo.addColorStop(0.58, "rgba(255,255,255,0.022)");
				halo.addColorStop(1, "rgba(255,255,255,0)");
				ctx.fillStyle = halo;
				ctx.beginPath();
				ctx.arc(cx, cy, outer, 0, Math.PI * 2);
				ctx.fill();

				const band = ringBandWidth * 0.65;
				for (const s of ringStars) {
					const twinkle =
						0.55 +
						0.45 * (Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5);
					const falloff = Math.max(0.15, 1 - Math.abs(s.radiusOffset) / band);
					const alpha = s.opacity * twinkle * falloff;
					if (s.r > 1.0) {
						const grad = ctx.createRadialGradient(
							s.x,
							s.y,
							0,
							s.x,
							s.y,
							s.r * 5,
						);
						grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.4})`);
						grad.addColorStop(1, "rgba(255,255,255,0)");
						ctx.fillStyle = grad;
						ctx.beginPath();
						ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
						ctx.fill();
					}
					ctx.fillStyle = `rgba(255,255,255,${alpha})`;
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, [count, ring, ringCount, ringRadiusFactor, ringBandWidth]);

	return <canvas ref={canvasRef} className={className} style={{ zIndex: 0 }} />;
}
