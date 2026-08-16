import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PrimaryPill, SecondaryPill } from "../components/Pills";

const HEADING_LINES: { words: string[]; color: string }[] = [
	{ words: ["Showcase,", "Sell"], color: "#111111" },
	{ words: ["&", "acquire", "arts", "to"], color: "#C0392B" },
	{ words: ["our", "marketplace."], color: "#111111" },
];

function HeadingWord({
	word,
	color,
	index,
}: {
	word: string;
	color: string;
	index: number;
}) {
	return (
		<motion.span
			style={{ display: "inline-block", marginRight: "0.25em", color }}
			initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
			whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
		>
			{word}
		</motion.span>
	);
}

/** Section 2 — the e-commerce / cascade section. data-section="two". */
export default function SectionEcommerce() {
	const sectionRef = useRef<HTMLElement>(null);
	const tagsInView = useInView(sectionRef, { amount: 0.95 });

	// Global word counter across all three heading lines.
	let globalWordIndex = -1;

	return (
		<section
			ref={sectionRef}
			data-section="two"
			style={{
				background: "#F2F2F0",
				minHeight: "calc(100vh - 30px)",
				padding: "80px 64px 0",
				display: "flex",
				alignItems: "flex-start",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Left text column. */}
			<div style={{ width: 520, paddingTop: 32 }}>
				<motion.div
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 11,
						fontWeight: 500,
						letterSpacing: "2.5px",
						color: "rgba(0,0,0,0.45)",
						marginBottom: 20,
					}}
					initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
					whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					E-COMMERCE
				</motion.div>

				<h2
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 60,
						fontWeight: 800,
						lineHeight: 1.05,
						letterSpacing: "-1.5px",
						margin: 0,
					}}
				>
					{HEADING_LINES.map((line, li) => (
						<span key={li} style={{ display: "block" }}>
							{line.words.map((w, wi) => {
								globalWordIndex += 1;
								return (
									<HeadingWord
										key={`${li}-${wi}`}
										word={w}
										color={line.color}
										index={globalWordIndex}
									/>
								);
							})}
						</span>
					))}
				</h2>

				<motion.p
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						marginTop: 28,
						fontSize: 15,
						fontWeight: 400,
						color: "rgba(0,0,0,0.55)",
						lineHeight: 1.65,
						maxWidth: 340,
					}}
					initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
					whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
				>
					Dynamic community where artists and buyers seamlessly merge. ArtFusion
					brings together creators and enthusiasts to share creativity.
				</motion.p>

				<motion.div
					style={{ display: "flex", marginTop: 48, gap: 12 }}
					initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
					whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
					viewport={{ once: true, margin: "-80px" }}
					transition={{ duration: 0.6, ease: "easeOut", delay: 0.7 }}
				>
					<PrimaryPill>Join for $9.99/m</PrimaryPill>
					<SecondaryPill outline>Read more</SecondaryPill>
				</motion.div>
			</div>

			{/* @howard floating tag. */}
			<motion.div
				style={{
					position: "absolute",
					top: 260,
					left: "calc(40% + 340px)",
					zIndex: 20,
					background: "#C0392B",
					borderRadius: 9999,
					padding: "9px 20px",
					fontFamily: '"Inter Tight", sans-serif',
					fontSize: 15,
					fontWeight: 600,
					color: "#FFFFFF",
				}}
				initial={{ opacity: 0, scale: 0.6 }}
				animate={
					tagsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
				}
				transition={{ duration: 0.5, ease: "easeOut" }}
			>
				@howard
				<span
					style={{
						position: "absolute",
						bottom: -9,
						left: "50%",
						transform: "translateX(-50%)",
						width: 0,
						height: 0,
						borderLeft: "8px solid transparent",
						borderRight: "8px solid transparent",
						borderTop: "10px solid #C0392B",
					}}
				/>
			</motion.div>

			{/* @robin floating tag. */}
			<motion.div
				style={{
					position: "absolute",
					top: 430,
					left: "calc(40% + 680px)",
					zIndex: 20,
					background: "#111111",
					borderRadius: 9999,
					padding: "9px 20px",
					fontFamily: '"Inter Tight", sans-serif',
					fontSize: 15,
					fontWeight: 600,
					color: "#FFFFFF",
				}}
				initial={{ opacity: 0, scale: 0.6 }}
				animate={
					tagsInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
				}
				transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
			>
				@robin
				<span
					style={{
						position: "absolute",
						bottom: -9,
						left: 20,
						width: 0,
						height: 0,
						borderLeft: "8px solid transparent",
						borderRight: "8px solid transparent",
						borderTop: "10px solid #111111",
					}}
				/>
			</motion.div>
		</section>
	);
}
