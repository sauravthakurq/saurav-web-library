/**
 * 28x28 logo: two overlapping diamond/parallelogram shapes filled with the brand
 * teal. The back shape is full opacity; the front shape is 0.85 opacity and
 * slightly offset down + right to suggest layered painter's palettes.
 */
export default function Logo() {
	return (
		<svg
			width={28}
			height={28}
			viewBox="0 0 28 28"
			fill="none"
			aria-hidden
			focusable="false"
		>
			{/* Back diamond (full opacity). */}
			<path
				d="M10.5 3.5 L20 11 L11.5 20 L2 12.5 Z"
				fill="#4ECDC4"
				fillOpacity={1}
			/>
			{/* Front diamond (0.85 opacity), offset down + right. */}
			<path
				d="M16 8 L25.5 15.5 L17 24.5 L7.5 17 Z"
				fill="#4ECDC4"
				fillOpacity={0.85}
			/>
		</svg>
	);
}
