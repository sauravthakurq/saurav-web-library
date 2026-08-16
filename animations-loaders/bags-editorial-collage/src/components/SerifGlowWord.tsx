import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { GLOW_COLOR, TEXT_COLOR } from "../lib/constants";

/**
 * The signature Instrument Serif accent word.
 *
 * Construction is identical for every accent word ("your", "elegance", "new",
 * "match"):
 *   - A dual-layer glow: an absolutely positioned, aria-hidden span behind it
 *     painted in #EAFE79 with a thick WebkitTextStroke of the same color,
 *     producing the fluorescent yellow-green halo; on top, a relatively
 *     positioned span renders the same word in solid #545454. The two layers
 *     share font-size / line-height / letter-spacing exactly, so the fill sits
 *     centered inside the glow.
 *   - The "tubular curl" entrance — a motion.span that animates from a
 *     foreshortened, rotated-back pose to a flat overshoot-settled pose, reading
 *     as a sticker unfurling forward off the page.
 */
export interface SerifGlowWordProps {
	word: string;
	/** Font size in px. */
	fontSize: number;
	/** Line-height in px. */
	lineHeight: number;
	/** Letter-spacing in px. */
	letterSpacing: number;
	/** WebkitTextStrokeWidth in px (10–20, sized to the word). */
	strokeWidth: number;
	/** Italic Instrument Serif when true. */
	italic?: boolean;
	/** Tubular-curl entrance delay in seconds. */
	delay?: number;
	/** Play the entrance once it scrolls into view rather than on mount. */
	inView?: boolean;
}

const CURL_INITIAL = {
	rotateX: -110,
	scaleY: 0.15,
	scaleX: 0.7,
	opacity: 0,
};

const CURL_ANIMATE = {
	rotateX: [-110, -70, -20, 5, -2, 0],
	scaleY: [0.15, 0.4, 0.8, 1.04, 0.98, 1],
	scaleX: [0.7, 0.85, 0.95, 1.02, 1, 1],
	opacity: [0, 0.4, 0.85, 1, 1, 1],
};

const CURL_TRANSITION = {
	duration: 0.7,
	ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
	times: [0, 0.2, 0.55, 0.75, 0.88, 1],
};

export default function SerifGlowWord({
	word,
	fontSize,
	lineHeight,
	letterSpacing,
	strokeWidth,
	italic = false,
	delay = 0,
	inView = false,
}: SerifGlowWordProps) {
	const shared: CSSProperties = {
		fontFamily: "'Instrument Serif', serif",
		fontStyle: italic ? "italic" : "normal",
		fontWeight: 400,
		fontSize: `${fontSize}px`,
		lineHeight: `${lineHeight}px`,
		letterSpacing: `${letterSpacing}px`,
		whiteSpace: "nowrap",
		display: "inline-block",
	};

	const animationProps = inView
		? {
				initial: CURL_INITIAL,
				whileInView: CURL_ANIMATE,
				viewport: { once: true, margin: "-40px" },
			}
		: {
				initial: CURL_INITIAL,
				animate: CURL_ANIMATE,
			};

	return (
		<motion.span
			{...animationProps}
			transition={{ ...CURL_TRANSITION, delay }}
			style={{
				position: "relative",
				display: "inline-block",
				transformPerspective: 600,
				transformOrigin: "top center",
			}}
		>
			{/* Glow halo layer */}
			<span
				aria-hidden="true"
				style={{
					...shared,
					position: "absolute",
					left: 0,
					top: 0,
					color: GLOW_COLOR,
					WebkitTextStrokeWidth: `${strokeWidth}px`,
					WebkitTextStrokeColor: GLOW_COLOR,
					pointerEvents: "none",
				}}
			>
				{word}
			</span>
			{/* Solid fill layer */}
			<span
				style={{
					...shared,
					position: "relative",
					color: TEXT_COLOR,
				}}
			>
				{word}
			</span>
		</motion.span>
	);
}
