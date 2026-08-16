import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useSpring,
} from "framer-motion";
import { useRef } from "react";

type Side = "left" | "right";

interface StoneRevealProps {
	side: Side;
	/** Dry/clean stone image. */
	baseSrc: string;
	/** Mossy/grass variant of the same stone, revealed under the cursor. */
	grassSrc: string;
	/** z-index of the base stone image. */
	zBase: number;
	/** z-index of the grass overlay (sits above the base). */
	zGrass: number;
}

/**
 * A photorealistic stone anchored to a bottom corner. Hovering paints a soft,
 * cursor-following circle of moss onto the stone via a radial-gradient CSS mask.
 *
 * The reveal radius is driven by a motion value (0 → 120 on enter) smoothed by a
 * spring so it grows and springs closed organically.
 */
export default function StoneReveal({
	side,
	baseSrc,
	grassSrc,
	zBase,
	zGrass,
}: StoneRevealProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Cursor position relative to the wrapper.
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Raw target radius, smoothed into `radius` by a spring.
	const radiusRaw = useMotionValue(0);
	const radius = useSpring(radiusRaw, { stiffness: 200, damping: 25 });

	// mask: radial-gradient(circle <radius>px at <x>px <y>px, black 0%, black 40%, transparent 100%)
	const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${x}px ${y}px, black 0%, black 40%, transparent 100%)`;

	const objectPosition = side === "left" ? "left bottom" : "right bottom";
	const enterX = side === "left" ? -40 : 40;

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		const rect = wrapperRef.current?.getBoundingClientRect();
		if (!rect) return;
		x.set(e.clientX - rect.left);
		y.set(e.clientY - rect.top);
	}

	return (
		<div
			ref={wrapperRef}
			className="absolute bottom-0 w-fit cursor-crosshair"
			style={{ [side]: 0 }}
			onMouseEnter={() => radiusRaw.set(120)}
			onMouseLeave={() => radiusRaw.set(0)}
			onMouseMove={handleMouseMove}
		>
			{/* Base (dry) stone — fades/slides in on load */}
			<motion.img
				src={baseSrc}
				alt=""
				aria-hidden="true"
				draggable={false}
				initial={{ opacity: 0, x: enterX }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
				className="block h-[280px] w-auto select-none sm:h-[380px] md:h-[500px] lg:h-[600px] xl:h-[680px]"
				style={{
					objectFit: "contain",
					objectPosition,
					position: "relative",
					zIndex: zBase,
				}}
			/>

			{/* Grass overlay — same stone, masked into a cursor-following moss patch */}
			<motion.img
				src={grassSrc}
				alt=""
				aria-hidden="true"
				draggable={false}
				className="pointer-events-none absolute bottom-0 h-[280px] w-auto select-none sm:h-[380px] md:h-[500px] lg:h-[600px] xl:h-[680px]"
				style={{
					[side]: 0,
					objectFit: "contain",
					objectPosition,
					zIndex: zGrass,
					maskImage: mask,
					WebkitMaskImage: mask,
				}}
			/>
		</div>
	);
}
