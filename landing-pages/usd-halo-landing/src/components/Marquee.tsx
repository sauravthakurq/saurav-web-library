import type { CSSProperties } from "react";

export interface MarqueeBrand {
	name: string;
	style: CSSProperties;
}

interface MarqueeProps {
	brands: MarqueeBrand[];
	/** Class applied to the moving track, e.g. "marquee-track". */
	trackClass: string;
	/** Name of the injected @keyframes rule, e.g. "marquee". */
	keyframesName: string;
	durationSeconds: number;
	/** Classes applied to each brand item. */
	itemClass: string;
}

/**
 * Infinite horizontal marquee. The brand list is rendered twice and the track
 * translates 0 → -50% so the loop is seamless.
 */
export default function Marquee({
	brands,
	trackClass,
	keyframesName,
	durationSeconds,
	itemClass,
}: MarqueeProps) {
	return (
		<>
			<style>{`
        @keyframes ${keyframesName} {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .${trackClass} {
          display: flex;
          width: max-content;
          animation: ${keyframesName} ${durationSeconds}s linear infinite;
        }
      `}</style>
			<div className={trackClass}>
				{[...brands, ...brands].map((brand, index) => (
					<span
						key={`${brand.name}-${index}`}
						className={itemClass}
						style={brand.style}
					>
						{brand.name}
					</span>
				))}
			</div>
		</>
	);
}
