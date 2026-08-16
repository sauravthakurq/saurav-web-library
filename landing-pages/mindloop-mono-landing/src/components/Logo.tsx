import { cn } from "@/lib/utils";

interface LogoMarkProps {
	className?: string;
	outerClassName?: string;
	innerClassName?: string;
}

/** Concentric-circles Mindloop mark. */
export function LogoMark({
	className,
	outerClassName,
	innerClassName,
}: LogoMarkProps) {
	return (
		<span
			aria-hidden
			className={cn(
				"flex items-center justify-center rounded-full",
				"h-7 w-7 border-2 border-foreground/60",
				outerClassName,
				className,
			)}
		>
			<span
				className={cn(
					"block rounded-full",
					"h-3 w-3 border border-foreground/60",
					innerClassName,
				)}
			/>
		</span>
	);
}
