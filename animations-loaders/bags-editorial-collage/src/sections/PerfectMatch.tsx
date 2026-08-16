import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SerifGlowWord from "../components/SerifGlowWord";
import { asset, TEXT_COLOR } from "../lib/constants";

const EASE_BACK = [0.34, 1.56, 0.64, 1] as const;

const ORBIT_RADIUS = 260;
const BAG_HALF = 80;
const LABEL_GAP = 8;
const LABEL_DIST = BAG_HALF + LABEL_GAP; // 88

const BAGS = [
	{ img: "baggy-1.png", baseAngle: 270, label: "(01)" },
	{ img: "baggy-2.png", baseAngle: 330, label: "(02)" },
	{ img: "baggy-3.png", baseAngle: 30, label: "(03)" },
	{ img: "baggy-4.png", baseAngle: 150, label: "(04)" },
	{ img: "baggy-5.png", baseAngle: 210, label: "(05)" },
	{ img: "baggy-6.png", baseAngle: 90, label: "(06)" },
];

export default function PerfectMatch() {
	// Continuous rotation engine.
	const [angle, setAngle] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (paused) return;
		let raf = 0;
		const tick = () => {
			setAngle((a) => a + 0.12);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [paused]);

	return (
		<section
			style={{
				position: "relative",
				background: "#f7f7f7",
				minHeight: "100vh",
				paddingBottom: 80,
				fontFamily: "'Inter Tight', sans-serif",
				overflow: "visible",
			}}
		>
			{/* Torn paper top edge — bleeds upward into the black of Section 2. */}
			<img
				src={asset("paper.png")}
				alt=""
				style={{
					position: "absolute",
					top: -188,
					left: 0,
					right: 0,
					width: "100%",
					height: "auto",
					objectFit: "cover",
					objectPosition: "top center",
					zIndex: 50,
					pointerEvents: "none",
				}}
			/>

			{/* Top badge text (two lines) */}
			<motion.div
				initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
				whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
				viewport={{ once: true, margin: "-60px" }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				style={{
					position: "relative",
					textAlign: "center",
					paddingTop: 120,
					zIndex: 60,
				}}
			>
				{["DESIGNED WITH PURPOSE.", "WORN WITH CONFIDENCE."].map((line) => (
					<div
						key={line}
						style={{
							fontFamily: "'Inter Tight', sans-serif",
							fontSize: 11,
							fontWeight: 500,
							letterSpacing: "2.5px",
							lineHeight: 1.8,
							color: "rgba(84,84,84,0.55)",
						}}
					>
						{line}
					</div>
				))}
			</motion.div>

			{/* Orbit stage */}
			<div
				style={{
					position: "relative",
					width: "100%",
					height: 640,
					zIndex: 60,
					marginTop: 20,
				}}
			>
				{/* Center title */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
					whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 10,
						pointerEvents: "none",
					}}
				>
					<span
						style={{
							display: "block",
							fontFamily: "'Inter Tight', sans-serif",
							fontSize: 64,
							fontWeight: 700,
							lineHeight: 1,
							letterSpacing: "-2px",
							color: TEXT_COLOR,
						}}
					>
						Find your
					</span>
					<div style={{ display: "flex", alignItems: "baseline" }}>
						<span
							style={{
								fontFamily: "'Inter Tight', sans-serif",
								fontSize: 64,
								fontWeight: 700,
								letterSpacing: "-2px",
								color: TEXT_COLOR,
							}}
						>
							perfect&nbsp;
						</span>
						<SerifGlowWord
							word="match"
							fontSize={64}
							lineHeight={64}
							letterSpacing={-2}
							strokeWidth={14}
							inView
							delay={0.5}
						/>
					</div>
				</motion.div>

				{/* Orbit center — six bags rotate around this 0×0 point. */}
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						width: 0,
						height: 0,
					}}
				>
					{BAGS.map((bag, i) => {
						const rad = ((angle + bag.baseAngle) * Math.PI) / 180;
						const x = Math.cos(rad) * ORBIT_RADIUS;
						const y = Math.sin(rad) * ORBIT_RADIUS;
						const labelX = Math.cos(rad) * LABEL_DIST;
						const labelY = Math.sin(rad) * LABEL_DIST;

						return (
							<div key={bag.img}>
								{/* Bag */}
								<div
									style={{
										position: "absolute",
										left: 0,
										top: 0,
										transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
										zIndex: 6,
									}}
								>
									<motion.div
										initial={{ scale: 0, opacity: 0 }}
										whileInView={{ scale: 1, opacity: 1 }}
										viewport={{ once: true, margin: "-80px" }}
										transition={{
											duration: 0.5,
											ease: EASE_BACK,
											delay: i * 0.08,
										}}
										whileHover={{
											scale: 1.12,
											filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))",
										}}
										onMouseEnter={() => setPaused(true)}
										onMouseLeave={() => setPaused(false)}
										style={{
											position: "relative",
											width: 160,
											height: 160,
											cursor: "pointer",
										}}
									>
										<img
											src={asset(bag.img)}
											alt=""
											style={{
												width: 160,
												height: 160,
												objectFit: "contain",
												display: "block",
											}}
										/>
									</motion.div>
								</div>

								{/* Radial label — floats 8px outside the bag along the radial
								    line away from center. */}
								<div
									style={{
										position: "absolute",
										left: 0,
										top: 0,
										transform: `translate(${labelX}px, ${labelY}px) translate(-50%, -50%)`,
										fontFamily: "'Instrument Serif', serif",
										fontSize: 16,
										fontWeight: 400,
										color: "rgba(84,84,84,0.65)",
										letterSpacing: "-0.5px",
										whiteSpace: "nowrap",
										pointerEvents: "none",
										zIndex: 6,
									}}
								>
									{bag.label}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Bottom block — eye + manifesto */}
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					gap: 16,
					maxWidth: 380,
					margin: "50px auto 0",
					padding: "0 40px",
					position: "relative",
					zIndex: 5,
				}}
			>
				<motion.img
					src={asset("eye.png")}
					alt=""
					initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
					whileInView={{ opacity: 0.7, scale: 1, rotate: 0 }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.5, ease: EASE_BACK }}
					style={{
						width: 32,
						height: 32,
						objectFit: "contain",
						flexShrink: 0,
						marginTop: 12,
					}}
				/>
				<motion.p
					initial={{ opacity: 0, filter: "blur(8px)", x: 16 }}
					whileInView={{ opacity: 1, filter: "blur(0px)", x: 0 }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
					style={{
						fontFamily: "'Inter Tight', sans-serif",
						fontSize: 13,
						fontWeight: 400,
						lineHeight: 1.75,
						color: "rgba(84,84,84,0.75)",
						textAlign: "justify",
						marginTop: 10,
					}}
				>
					We believe a bag is more than an accessory — It's a companion to your
					every moment. From the daily rush to quiet evenings, our pieces are
					crafted to be effortlessly elegant, enduring, and distinctively yours.
				</motion.p>
			</div>
		</section>
	);
}
