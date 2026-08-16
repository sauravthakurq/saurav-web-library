import { motion, useInView } from "framer-motion";
import { type CSSProperties, useRef } from "react";

interface WordsPullUpProps {
	text: string;
	className?: string;
	style?: CSSProperties;
	showAsterisk?: boolean;
}

export default function WordsPullUp({
	text,
	className = "",
	style,
	showAsterisk = false,
}: WordsPullUpProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true });
	const words = text.split(" ");

	return (
		<div ref={ref} className={className} style={style}>
			{words.map((word, i) => {
				const isLast = i === words.length - 1;
				return (
					<motion.span
						key={`${word}-${i}`}
						className="inline-block whitespace-pre"
						initial={{ y: 20, opacity: 0 }}
						animate={isInView ? { y: 0, opacity: 1 } : {}}
						transition={{
							delay: i * 0.08,
							duration: 0.75,
							ease: [0.16, 1, 0.3, 1],
						}}
					>
						{isLast && showAsterisk ? (
							<span className="relative inline-block">
								{word}
								<span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em]">
									*
								</span>
							</span>
						) : (
							word
						)}
						{!isLast ? " " : ""}
					</motion.span>
				);
			})}
		</div>
	);
}
