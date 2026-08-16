import type { SVGProps } from "react";

/**
 * Single source of truth for every SVG path used in the hero.
 * Components import icons from this file only.
 */
export const ICON_PATHS = {
	/** Chevron down arrow (nav "Features" dropdown). */
	chevronDown: "M6 9l6 6 6-6",
	/** Up arrow (submit button). */
	upArrow: "M12 19V5m0 0l-6 6m6-6l6 6",
	/** Four-point star (badge "New"). */
	star: "M12 2c.9 5.4 2.7 7.2 8.1 8.1-5.4.9-7.2 2.7-8.1 8.1-.9-5.4-2.7-7.2-8.1-8.1C9.3 9.2 11.1 7.4 12 2z",
	/** AI sparkle — one large + one small spark ("Powered by GPT-4o"). */
	aiSparkle:
		"M9.5 2.5c.74 4.46 2.3 6.02 6.76 6.76-4.46.74-6.02 2.3-6.76 6.76-.74-4.46-2.3-6.02-6.76-6.76 4.46-.74 6.02-2.3 6.76-6.76z M18.25 13.5c.5 2.97 1.53 4 4.5 4.5-2.97.5-4 1.53-4.5 4.5-.5-2.97-1.53-4-4.5-4.5 2.97-.5 4-1.53 4.5-4.5z",
	/** Paperclip ("Attach"). */
	paperclip:
		"M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
	/** Microphone ("Voice"). */
	microphone:
		"M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z M19 10v1a7 7 0 01-14 0v-1 M12 18v4",
	/** Magnifying glass ("Prompts"). */
	search: "M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35",
} as const;

export type IconName = keyof typeof ICON_PATHS;

const FILLED_ICONS: ReadonlySet<IconName> = new Set(["star", "aiSparkle"]);

interface IconProps extends SVGProps<SVGSVGElement> {
	name: IconName;
	size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
	const filled = FILLED_ICONS.has(name);
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={filled ? "currentColor" : "none"}
			stroke={filled ? "none" : "currentColor"}
			strokeWidth={filled ? 0 : 2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...rest}
		>
			<path d={ICON_PATHS[name]} />
		</svg>
	);
}
