import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";

type FadeInTag = "div" | "nav" | "span" | "section" | "header" | "footer";

interface FadeInProps {
	children: ReactNode;
	as?: FadeInTag;
	className?: string;
	style?: CSSProperties;
	delay?: number;
	duration?: number;
	x?: number;
	y?: number;
}

export default function FadeIn({
	children,
	as = "div",
	className,
	style,
	delay = 0,
	duration = 0.7,
	x = 0,
	y = 30,
}: FadeInProps) {
	const MotionTag = useMemo(() => motion.create(as), [as]);

	return (
		<MotionTag
			className={className}
			style={style}
			initial={{ opacity: 0, x, y }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={{ once: true, margin: "50px", amount: 0 }}
			transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
		>
			{children}
		</MotionTag>
	);
}
