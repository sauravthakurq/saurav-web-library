import * as React from "react";

/**
 * Minimal Slot primitive (shadcn uses @radix-ui/react-slot; this is a tiny,
 * dependency-free equivalent that merges props/className/ref onto a single
 * child element so `<Button asChild>` works).
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
	children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
	({ children, ...slotProps }, ref) => {
		if (!React.isValidElement(children)) {
			return null;
		}

		const child = children as React.ReactElement<Record<string, unknown>>;
		const childProps = child.props;

		const mergedClassName = [
			slotProps.className,
			childProps.className as string,
		]
			.filter(Boolean)
			.join(" ");

		return React.cloneElement(child, {
			...slotProps,
			...childProps,
			className: mergedClassName || undefined,
			ref,
		});
	},
);
Slot.displayName = "Slot";
