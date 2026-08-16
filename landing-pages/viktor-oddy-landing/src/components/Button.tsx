import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: ButtonVariant;
	children: ReactNode;
}

const PRIMARY_SHADOW =
	"shadow-[0_1px_2px_0_rgba(5,26,36,0.1),0_4px_4px_0_rgba(5,26,36,0.09),0_9px_6px_0_rgba(5,26,36,0.05),0_17px_7px_0_rgba(5,26,36,0.01),0_26px_7px_0_rgba(5,26,36,0),inset_0_2px_8px_0_rgba(255,255,255,0.5)]";

const SECONDARY_SHADOW =
	"shadow-[0_0_0_0.5px_rgba(0,0,0,0.05),0_4px_30px_rgba(0,0,0,0.08)]";

const TERTIARY_SHADOW =
	"shadow-[0_0_0_0.5px_rgba(0,0,0,0.05),0_4px_30px_rgba(0,0,0,0.08),0_1px_2px_0_rgba(5,26,36,0.1),0_4px_4px_0_rgba(5,26,36,0.09),0_9px_6px_0_rgba(5,26,36,0.05)]";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary: `bg-[#051A24] text-white ${PRIMARY_SHADOW}`,
	secondary: `bg-white text-[#051A24] ${SECONDARY_SHADOW}`,
	tertiary: `bg-white text-[#051A24] ${TERTIARY_SHADOW}`,
};

export default function Button({
	variant = "primary",
	children,
	className = "",
	...rest
}: ButtonProps) {
	return (
		<a
			className={`inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-7 py-3 text-sm font-medium transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${VARIANT_CLASSES[variant]} ${className}`}
			{...rest}
		>
			{children}
		</a>
	);
}
