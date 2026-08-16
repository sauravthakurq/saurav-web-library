import { motion } from "framer-motion";
import AutoplayBanner from "../components/AutoplayBanner";

const HEADING_WORDS = ["Gateway", "to", "artist", "people."];

/** Section 3 — class / banner section. data-section="three". */
export default function SectionClass() {
	return (
		<section
			data-section="three"
			style={{
				background: "#F2F2F0",
				minHeight: "100vh",
				padding: "80px 64px 80px",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Text block. */}
			<div
				style={{
					maxWidth: 520,
					marginBottom: 40,
					position: "relative",
					zIndex: 10,
				}}
			>
				<motion.div
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 11,
						fontWeight: 500,
						letterSpacing: "2.5px",
						color: "rgba(0,0,0,0.45)",
						marginBottom: 20,
					}}
					initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
					whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.55, ease: "easeOut" }}
				>
					CLASS BY REATHA C. PHELAN
				</motion.div>

				<h2
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 80,
						fontWeight: 800,
						lineHeight: 1.0,
						letterSpacing: "-2.5px",
						color: "#111111",
						margin: 0,
					}}
				>
					{HEADING_WORDS.map((w, i) => (
						<motion.span
							key={i}
							style={{ display: "inline-block", marginRight: "0.2em" }}
							initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
							whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.07 }}
						>
							{w}
						</motion.span>
					))}
				</h2>
			</div>

			{/* @reatha floating tag. */}
			<motion.div
				style={{
					position: "absolute",
					top: 120,
					right: 180,
					zIndex: 10,
					background: "#111111",
					borderRadius: 9999,
					padding: "10px 22px",
					fontFamily: '"Inter Tight", sans-serif',
					fontSize: 16,
					fontWeight: 600,
					color: "#FFFFFF",
				}}
				initial={{ opacity: 0 }}
				whileInView={{
					opacity: [0, 1],
					scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
					scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
				}}
				viewport={{ once: true }}
				transition={{ duration: 0.8, delay: 0.65 }}
			>
				@reatha
				<span
					style={{
						position: "absolute",
						bottom: -9,
						right: 24,
						width: 0,
						height: 0,
						borderLeft: "8px solid transparent",
						borderRight: "4px solid transparent",
						borderTop: "10px solid #111111",
					}}
				/>
			</motion.div>

			<AutoplayBanner />
		</section>
	);
}
