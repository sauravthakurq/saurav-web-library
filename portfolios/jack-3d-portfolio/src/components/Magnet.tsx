import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface MagnetProps {
	children: ReactNode;
	padding?: number;
	strength?: number;
	activeTransition?: string;
	inactiveTransition?: string;
	className?: string;
}

/**
 * Mouse-following magnetic hover effect. The wrapped content drifts toward
 * the cursor (offset divided by `strength`) once the cursor comes within
 * `padding` px of the element's edge, then eases back when it leaves.
 */
export default function Magnet({
	children,
	padding = 100,
	strength = 2,
	activeTransition = "transform 0.3s ease-out",
	inactiveTransition = "transform 0.6s ease-in-out",
	className,
}: MagnetProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [isActive, setIsActive] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			const wrapper = wrapperRef.current;
			if (!wrapper) return;

			const { left, top, width, height } = wrapper.getBoundingClientRect();
			const centerX = left + width / 2;
			const centerY = top + height / 2;
			const distX = Math.abs(centerX - e.clientX);
			const distY = Math.abs(centerY - e.clientY);

			if (distX < width / 2 + padding && distY < height / 2 + padding) {
				setIsActive(true);
				setPosition({
					x: (e.clientX - centerX) / strength,
					y: (e.clientY - centerY) / strength,
				});
			} else {
				setIsActive(false);
				setPosition({ x: 0, y: 0 });
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [padding, strength]);

	return (
		<div
			ref={wrapperRef}
			className={className}
			style={{ position: "relative" }}
		>
			<div
				style={{
					transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
					transition: isActive ? activeTransition : inactiveTransition,
					willChange: "transform",
				}}
			>
				{children}
			</div>
		</div>
	);
}
