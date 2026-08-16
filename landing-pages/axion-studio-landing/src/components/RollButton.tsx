import { ArrowRight } from "lucide-react";

const EASE = "ease-[cubic-bezier(0.25,0.1,0.25,1)]";

interface RollButtonProps {
	label: string;
	/** Background, text size and padding of the pill button. */
	className: string;
	/** Sizing of the circle that holds the arrow. */
	circleClassName: string;
	/** Color of the arrow inside the circle. */
	arrowClassName: string;
	arrowSize?: number;
	onClick?: () => void;
}

/**
 * Pill CTA with the signature hover interactions: the label rolls up
 * (duplicated copy slides into view) while the arrow rotates -45deg.
 */
export default function RollButton({
	label,
	className,
	circleClassName,
	arrowClassName,
	arrowSize = 14,
	onClick,
}: RollButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`group flex items-center gap-3 rounded-full font-medium transition-colors duration-500 ${EASE} ${className}`}
		>
			<span className="flex h-[20px] flex-col overflow-hidden">
				<span
					className={`flex flex-col transition-transform duration-500 ${EASE} group-hover:-translate-y-1/2`}
				>
					<span className="flex h-[20px] items-center whitespace-nowrap">
						{label}
					</span>
					<span
						aria-hidden="true"
						className="flex h-[20px] items-center whitespace-nowrap"
					>
						{label}
					</span>
				</span>
			</span>
			<span
				className={`flex items-center justify-center rounded-full bg-white ${circleClassName}`}
			>
				<ArrowRight
					size={arrowSize}
					className={`transition-transform duration-500 ${EASE} group-hover:-rotate-45 ${arrowClassName}`}
				/>
			</span>
		</button>
	);
}
