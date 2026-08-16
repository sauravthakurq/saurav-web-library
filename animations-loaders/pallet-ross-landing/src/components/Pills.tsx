import { useState } from "react";

/** Black pill — "Join for $9.99/m". */
export function PrimaryPill({ children }: { children: React.ReactNode }) {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				background: hover ? "#333333" : "#111111",
				color: "#FFFFFF",
				fontFamily: '"Inter Tight", sans-serif',
				fontSize: 15,
				fontWeight: 600,
				padding: "14px 28px",
				borderRadius: 9999,
				border: "none",
				cursor: "pointer",
				whiteSpace: "nowrap",
				transition: "background 0.2s ease",
			}}
		>
			{children}
		</button>
	);
}

/** Transparent secondary pill — "Read more". `outline` adds a hairline border. */
export function SecondaryPill({
	children,
	outline = false,
}: {
	children: React.ReactNode;
	outline?: boolean;
}) {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				background: hover
					? outline
						? "rgba(0,0,0,0.05)"
						: "rgba(0,0,0,0.06)"
					: "transparent",
				color: "#111111",
				fontFamily: '"Inter Tight", sans-serif',
				fontSize: 15,
				fontWeight: 500,
				padding: "14px 20px",
				borderRadius: 9999,
				border: outline ? "1.5px solid rgba(0,0,0,0.15)" : "none",
				cursor: "pointer",
				whiteSpace: "nowrap",
				transition: "background 0.2s ease",
			}}
		>
			{children}
		</button>
	);
}
