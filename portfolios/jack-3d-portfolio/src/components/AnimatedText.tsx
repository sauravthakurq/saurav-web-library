import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { useRef } from "react";

interface AnimatedTextProps {
	text: string;
	className?: string;
	style?: CSSProperties;
}

interface CharProps {
	char: string;
	progress: MotionValue<number>;
	range: [number, number];
}

function Char({ char, progress, range }: CharProps) {
	const opacity = useTransform(progress, range, [0.2, 1]);

	return (
		<span className="relative inline-block">
			<span className="invisible">{char}</span>
			<motion.span className="absolute left-0 top-0" style={{ opacity }}>
				{char}
			</motion.span>
		</span>
	);
}

/**
 * Character-by-character scroll reveal: each character fades from 0.2 to
 * full opacity as the paragraph moves through the viewport. Characters are
 * grouped per word (inline-block) so line wrapping only happens at spaces.
 */
export default function AnimatedText({
	text,
	className,
	style,
}: AnimatedTextProps) {
	const ref = useRef<HTMLParagraphElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 0.8", "end 0.2"],
	});

	const words = text.split(" ");
	const totalChars = text.length;
	let charCursor = 0;

	return (
		<p ref={ref} className={className} style={style}>
			{words.map((word, wordIndex) => {
				const wordStart = charCursor;
				charCursor += word.length + 1;
				return (
					<span key={wordIndex}>
						<span className="inline-block">
							{word.split("").map((char, charIndex) => {
								const globalIndex = wordStart + charIndex;
								return (
									<Char
										key={charIndex}
										char={char}
										progress={scrollYProgress}
										range={[
											globalIndex / totalChars,
											Math.min((globalIndex + 1) / totalChars, 1),
										]}
									/>
								);
							})}
						</span>
						{wordIndex < words.length - 1 ? " " : null}
					</span>
				);
			})}
		</p>
	);
}
