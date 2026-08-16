import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function IndicatorButton({
	dir,
	label,
	children,
}: {
	dir: 1 | -1;
	label: string;
	children: React.ReactNode;
}) {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			aria-label={label}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={() =>
				window.scrollBy({ top: dir * window.innerHeight, behavior: "smooth" })
			}
			style={{
				width: 36,
				height: 36,
				border: "1.5px solid rgba(0,0,0,0.15)",
				borderRadius: 8,
				background: hover ? "rgba(0,0,0,0.05)" : "transparent",
				cursor: "pointer",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				transition: "background 0.2s ease",
			}}
		>
			{children}
		</button>
	);
}

/** Fixed vertical scroll indicator at right 24px, vertically centered, z-index 40. */
export default function ScrollIndicator() {
	return (
		<div
			style={{
				position: "fixed",
				right: 24,
				top: "50%",
				transform: "translateY(-50%)",
				zIndex: 40,
				display: "flex",
				flexDirection: "column",
				gap: 8,
			}}
		>
			<IndicatorButton dir={-1} label="Scroll up">
				<ChevronUp size={16} color="#111111" />
			</IndicatorButton>
			<IndicatorButton dir={1} label="Scroll down">
				<ChevronDown size={16} color="#111111" />
			</IndicatorButton>
		</div>
	);
}
