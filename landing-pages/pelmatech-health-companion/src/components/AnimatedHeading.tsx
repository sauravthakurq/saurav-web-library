import { motion } from "motion/react";
import type * as React from "react";

/**
 * Shared entrance-animation primitives. Every headline, paragraph, and image on
 * the page enters with one of these exact motion definitions.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "-80px" } as const;

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface AnimatedHeadingProps {
	children: React.ReactNode;
	className?: string;
	as?: HeadingTag;
	delay?: number;
}

export function AnimatedHeading({
	children,
	className,
	as: As = "h2",
	delay = 0,
}: AnimatedHeadingProps) {
	const MotionTag = motion.create(As);
	return (
		<MotionTag
			className={className}
			initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
			whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			viewport={VIEWPORT}
			transition={{ duration: 0.9, delay, ease: EASE }}
		>
			{children}
		</MotionTag>
	);
}

interface AnimatedTextProps {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}

export function AnimatedText({
	children,
	className,
	delay = 0.15,
}: AnimatedTextProps) {
	return (
		<motion.p
			className={className}
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={VIEWPORT}
			transition={{ duration: 0.7, delay, ease: EASE }}
		>
			{children}
		</motion.p>
	);
}

interface MaskedImageProps {
	src: string;
	alt: string;
	className?: string;
	delay?: number;
}

export function MaskedImage({
	src,
	alt,
	className,
	delay = 0,
}: MaskedImageProps) {
	return (
		<motion.div
			className={className}
			initial={{ clipPath: "inset(100% 0 0 0)" }}
			whileInView={{ clipPath: "inset(0% 0 0 0)" }}
			viewport={VIEWPORT}
			transition={{ duration: 1.1, delay, ease: EASE }}
		>
			<img src={src} alt={alt} className="w-full h-full object-cover" />
		</motion.div>
	);
}
