import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.svg";

const EASE = [0.22, 1, 0.36, 1] as const;

const TOTAL = 3.6; // seconds

const RAY_ANGLES = [0, 30, 60, 120, 150, 210, 240, 300, 330];

export default function IntroSequence() {
	const [hidden, setHidden] = useState(false);
	const [logoOk, setLogoOk] = useState(true);

	const reduced =
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

	useEffect(() => {
		const ms = reduced ? 100 : 3600;
		const id = setTimeout(() => setHidden(true), ms);
		return () => clearTimeout(id);
	}, [reduced]);

	if (hidden) return null;

	const total = reduced ? 0.1 : TOTAL;

	return (
		<div
			className="fixed inset-0 pointer-events-none"
			style={{ zIndex: 100 }}
			aria-hidden="true"
		>
			{/* Solid backdrop. */}
			<motion.div
				className="absolute inset-0"
				style={{ backgroundColor: "oklch(0.16 0.004 240)" }}
				initial={{ opacity: 1 }}
				animate={{ opacity: [1, 1, 0] }}
				transition={{ duration: total, times: [0, 0.82, 1], ease: EASE }}
			/>

			{/* Concentric circles. */}
			<div className="absolute inset-0 grid place-items-center">
				{[1, 2, 3].map((n, i) => (
					<motion.div
						key={n}
						className="absolute rounded-full border border-white/10"
						style={{
							width: 260 * n,
							height: 260 * n,
							top: "50%",
							left: "50%",
							marginTop: -(260 * n) / 2,
							marginLeft: -(260 * n) / 2,
						}}
						initial={{ opacity: 0, scale: 0.15 }}
						animate={
							reduced
								? { opacity: 0 }
								: { opacity: [0, 0.55, 0], scale: [0.15, 1, 1.4] }
						}
						transition={{
							duration: 2.4,
							delay: 1.22 + i * 0.12,
							ease: EASE,
						}}
					/>
				))}
			</div>

			{/* Rays. */}
			<svg
				className="absolute inset-0 w-full h-full"
				viewBox="0 0 100 100"
				preserveAspectRatio="xMidYMid slice"
			>
				{RAY_ANGLES.map((deg, i) => {
					const rad = (deg * Math.PI) / 180;
					const cx = 50;
					const cy = 50;
					const len = 60;
					const x2 = cx + Math.cos(rad) * len;
					const y2 = cy + Math.sin(rad) * len;
					return (
						<motion.line
							key={deg}
							x1={cx}
							y1={cy}
							x2={x2}
							y2={y2}
							stroke="white"
							strokeOpacity={0.45}
							strokeWidth={0.12}
							strokeLinecap="round"
							initial={{ pathLength: 0, opacity: 0 }}
							animate={
								reduced
									? { opacity: 0 }
									: { pathLength: [0, 1, 1], opacity: [0, 0.65, 0] }
							}
							transition={{
								duration: 2.0,
								delay: 1.2 + i * 0.05,
								times: [0, 0.7, 1],
								ease: EASE,
							}}
						/>
					);
				})}
			</svg>

			{/* Logo container -> snaps to top-left TopBar slot. */}
			<motion.div
				className="absolute"
				style={{ transformOrigin: "top left" }}
				initial={{
					top: "50%",
					left: "50%",
					x: "-50%",
					y: "-50%",
					scale: 1,
				}}
				animate={
					reduced
						? { top: 24, left: 24, x: 0, y: 0, scale: 0.42 }
						: {
								top: ["50%", "50%", "50%", 24],
								left: ["50%", "50%", "50%", 24],
								x: ["-50%", "-50%", "-50%", "0%"],
								y: ["-50%", "-50%", "-50%", "0%"],
								scale: [1, 1, 1, 0.42],
							}
				}
				transition={{ duration: total, times: [0, 0.6, 0.82, 1], ease: EASE }}
			>
				<div className="relative" style={{ height: 64 }}>
					{/* Wordmark width-clip reveal. */}
					<motion.div
						className="overflow-hidden"
						style={{ height: 64 }}
						initial={{ width: 64, opacity: 0 }}
						animate={
							reduced
								? { width: 268, opacity: 1 }
								: {
										width: [64, 64, 64, 268, 268],
										opacity: [0, 0, 1, 1, 1],
									}
						}
						transition={{
							duration: total,
							times: [0, 0.3, 0.42, 0.78, 1],
							ease: EASE,
						}}
					>
						{logoOk ? (
							<img
								src={logo}
								alt="VALMAX"
								className="max-w-none block"
								style={{ width: 268, height: 64 }}
								onError={() => setLogoOk(false)}
							/>
						) : (
							<span
								className="font-display font-black text-white block whitespace-nowrap"
								style={{ fontSize: 48, lineHeight: "64px" }}
							>
								VALMAX
							</span>
						)}
					</motion.div>

					{/* White dot over the icon center (x = 32). */}
					{!reduced && (
						<motion.div
							className="absolute rounded-full bg-white"
							style={{ top: 32, left: 32, x: "-50%", y: "-50%" }}
							initial={{ width: 8, height: 8, opacity: 1 }}
							animate={{
								width: [8, 10, 64, 64],
								height: [8, 10, 64, 64],
								opacity: [1, 1, 1, 0],
							}}
							transition={{
								duration: total,
								times: [0, 0.18, 0.4, 1],
								ease: EASE,
							}}
						/>
					)}
				</div>
			</motion.div>
		</div>
	);
}
