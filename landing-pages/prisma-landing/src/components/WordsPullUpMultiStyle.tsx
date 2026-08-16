import { motion, useInView } from "framer-motion";
import { type CSSProperties, useRef } from "react";

export interface TextSegment {
	text: string;
	className?: string;
}

interface WordsPullUpMultiStyleProps {
	segments: TextSegment[];
	className?: string;
	style?: CSSProperties;
}

export default function WordsPullUpMultiStyle({
	segments,
	className = "",
	style,
}: WordsPullUpMultiStyleProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true });
	const words = segments.flatMap((segment) =>
		segment.text
			.split(" ")
			.map((word) => ({ word, className: segment.className ?? "" })),
	);

	return (
		<div
			ref={ref}
			className={`inline-flex flex-wrap justify-center ${className}`}
			style={style}
		>
			{words.map((item, i) => (
				<motion.span
					key={`${item.word}-${i}`}
					className={`inline-block whitespace-pre ${item.className}`}
					initial={{ y: 20, opacity: 0 }}
					animate={isInView ? { y: 0, opacity: 1 } : {}}
					transition={{
						delay: i * 0.08,
						duration: 0.75,
						ease: [0.16, 1, 0.3, 1],
					}}
				>
					{item.word}
					{i < words.length - 1 ? " " : ""}
				</motion.span>
			))}
		</div>
	);
}
