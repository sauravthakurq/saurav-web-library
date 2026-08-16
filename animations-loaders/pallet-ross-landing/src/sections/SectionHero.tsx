import { motion } from "framer-motion";
import { PrimaryPill, SecondaryPill } from "../components/Pills";

const LINE_ONE = ["A", "place", "to", "display"];
const LINE_TWO = ["your", "masterpiece."];

/** Squash-and-stretch jelly keyframes shared by the chat bubbles. */
const jelly = {
	opacity: [0, 1],
	scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
	scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
};

function HeadlineWord({ word, index }: { word: string; index: number }) {
	return (
		<motion.span
			style={{ display: "inline-block", marginRight: "0.25em" }}
			initial={{ opacity: 0, y: 28 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
		>
			{word}
		</motion.span>
	);
}

/** Section 1 — the hero. */
export default function SectionHero() {
	return (
		<section
			style={{ minHeight: "100vh", overflow: "hidden", position: "relative" }}
		>
			<main
				style={{
					paddingTop: 140,
					paddingLeft: 64,
					paddingRight: 64,
					maxWidth: 1228,
					margin: "0 auto",
				}}
			>
				<h1
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 96,
						fontWeight: 800,
						lineHeight: 1.0,
						letterSpacing: "-3px",
						color: "#111111",
						maxWidth: 1100,
						margin: 0,
					}}
				>
					{LINE_ONE.map((w, i) => (
						<HeadlineWord key={`l1-${i}`} word={w} index={i} />
					))}
					<br />
					{LINE_TWO.map((w, i) => (
						<HeadlineWord
							key={`l2-${i}`}
							word={w}
							index={LINE_ONE.length + i}
						/>
					))}
				</h1>

				{/* 260px spacer that hosts the Section 1 cards (in the overlay) + chat bubbles. */}
				<div
					style={{
						position: "relative",
						width: "100%",
						height: 260,
						marginTop: 40,
					}}
				>
					{/* @coplin bubble */}
					<motion.div
						style={{
							position: "absolute",
							left: "calc(50% - 320px)",
							top: -12,
							zIndex: 20,
							background: "#4D7EFF",
							padding: "8px 18px",
							borderRadius: 9999,
							fontFamily: '"Inter Tight", sans-serif',
							fontSize: 15,
							fontWeight: 600,
							color: "#FFFFFF",
						}}
						initial={{ opacity: 0 }}
						animate={jelly}
						transition={{ duration: 0.8, delay: 3.05 }}
					>
						@coplin
						<span
							style={{
								position: "absolute",
								bottom: -8,
								left: 16,
								width: 0,
								height: 0,
								borderLeft: "8px solid transparent",
								borderRight: "4px solid transparent",
								borderTop: "10px solid #4D7EFF",
							}}
						/>
					</motion.div>

					{/* @andrea bubble */}
					<motion.div
						style={{
							position: "absolute",
							right: "calc(50% - 420px)",
							top: -20,
							zIndex: 20,
							background: "#3DBF7A",
							padding: "8px 18px",
							borderRadius: 9999,
							fontFamily: '"Inter Tight", sans-serif',
							fontSize: 15,
							fontWeight: 600,
							color: "#FFFFFF",
						}}
						initial={{ opacity: 0 }}
						animate={jelly}
						transition={{ duration: 0.8, delay: 3.2 }}
					>
						@andrea
						<span
							style={{
								position: "absolute",
								bottom: -8,
								right: 16,
								width: 0,
								height: 0,
								borderLeft: "4px solid transparent",
								borderRight: "8px solid transparent",
								borderTop: "10px solid #3DBF7A",
							}}
						/>
					</motion.div>
				</div>

				<motion.p
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 16,
						fontWeight: 400,
						color: "rgba(0,0,0,0.55)",
						lineHeight: 1.6,
						maxWidth: 480,
						marginTop: 48,
					}}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 2.2 }}
				>
					Artists can display their masterpieces, and buyers can discover and
					purchase works that resonate with them.
				</motion.p>

				<motion.div
					style={{
						display: "flex",
						gap: 16,
						marginTop: 28,
						paddingBottom: 80,
					}}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 2.4 }}
				>
					<PrimaryPill>Join for $9.99/m</PrimaryPill>
					<SecondaryPill>Read more</SecondaryPill>
				</motion.div>
			</main>
		</section>
	);
}
