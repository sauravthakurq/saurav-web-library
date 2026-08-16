const TICKS = 40;
const CENTER_X = 100;
const CENTER_Y = 100;
const OUTER_RADIUS = 80;
const INNER_RADIUS = OUTER_RADIUS - 10;

interface GaugeProps {
	value: number;
	color?: string;
	showLabels?: boolean;
	min?: string;
	max?: string;
}

/**
 * Semi-circular tick gauge: 40 ticks across a 180° arc (angle π → 2π),
 * with the active tick count proportional to `value`.
 */
export default function Gauge({
	value,
	color = "#ef4d23",
	showLabels = false,
	min,
	max,
}: GaugeProps) {
	const activeCount = Math.round((value / 100) * TICKS);

	return (
		<div className="mx-auto w-full" style={{ maxWidth: 260 }}>
			<svg
				viewBox="0 0 200 120"
				className="block w-full"
				role="img"
				aria-label={`Gauge at ${value}%`}
			>
				{Array.from({ length: TICKS }, (_, i) => {
					const angle = Math.PI + (i / (TICKS - 1)) * Math.PI;
					const cos = Math.cos(angle);
					const sin = Math.sin(angle);
					return (
						<line
							key={i}
							x1={CENTER_X + INNER_RADIUS * cos}
							y1={CENTER_Y + INNER_RADIUS * sin}
							x2={CENTER_X + OUTER_RADIUS * cos}
							y2={CENTER_Y + OUTER_RADIUS * sin}
							stroke={i < activeCount ? color : "#d4d4d8"}
							strokeWidth={2.5}
							strokeLinecap="round"
						/>
					);
				})}
				<text
					x={100}
					y={105}
					textAnchor="middle"
					fontSize={22}
					fontWeight={600}
					fill="#171717"
				>
					{value}%
				</text>
			</svg>
			{showLabels && (
				<div className="flex justify-between text-[11px] text-neutral-500">
					<span>{min}</span>
					<span>{max}</span>
				</div>
			)}
		</div>
	);
}
