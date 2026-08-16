import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "solid" | "outline" | "pill";

const INNER_STYLES: Record<Variant, string> = {
	solid:
		"bg-text-primary px-7 py-3.5 text-sm font-medium text-bg group-hover:bg-bg group-hover:text-text-primary",
	outline:
		"border-2 border-stroke bg-bg px-7 py-3.5 text-sm font-medium text-text-primary group-hover:border-transparent",
	pill: "border border-stroke bg-bg px-5 py-2.5 text-sm text-muted group-hover:border-transparent group-hover:text-text-primary",
};

interface GradientRingButtonProps
	extends AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: Variant;
	children: ReactNode;
}

/**
 * Pill button that reveals an animated accent-gradient border ring on hover.
 * The ring is an oversized gradient layer sitting 2px proud of the opaque inner pill.
 */
const GradientRingButton = ({
	variant = "solid",
	children,
	className = "",
	...rest
}: GradientRingButtonProps) => (
	<a
		className={`group relative inline-flex transition-transform duration-300 hover:scale-105 ${className}`}
		{...rest}
	>
		<span
			aria-hidden
			className="accent-gradient-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		/>
		<span
			className={`relative inline-flex items-center gap-2 rounded-full transition-colors duration-300 ${INNER_STYLES[variant]}`}
		>
			{children}
		</span>
	</a>
);

export default GradientRingButton;
