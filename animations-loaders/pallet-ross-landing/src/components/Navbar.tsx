import { Settings, User } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";

const NAV_TRAILING = ["Pricing", "Contact", "Solution", "E-Commerce"];

function TextButton({
	children,
	dot,
}: {
	children: React.ReactNode;
	dot?: boolean;
}) {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				fontFamily: '"Inter Tight", sans-serif',
				fontSize: 14,
				fontWeight: 500,
				color: "#111111",
				padding: "8px 14px",
				background: hover ? "rgba(0,0,0,0.04)" : "transparent",
				border: "none",
				borderRadius: 10,
				cursor: "pointer",
				display: "inline-flex",
				alignItems: "center",
				whiteSpace: "nowrap",
				transition: "background 0.2s ease",
			}}
		>
			{dot && (
				<span
					style={{
						display: "inline-block",
						width: 14,
						height: 14,
						borderRadius: "50%",
						background: "#4ECDC4",
						marginRight: 6,
					}}
				/>
			)}
			{children}
		</button>
	);
}

function IconButton({
	children,
	label,
}: {
	children: React.ReactNode;
	label: string;
}) {
	const [hover, setHover] = useState(false);
	return (
		<button
			type="button"
			aria-label={label}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			style={{
				padding: 8,
				background: hover ? "rgba(0,0,0,0.05)" : "transparent",
				border: "none",
				borderRadius: 10,
				cursor: "pointer",
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				transition: "background 0.2s ease",
			}}
		>
			{children}
		</button>
	);
}

/** Fixed transparent top navbar at z-index 50. */
export default function Navbar() {
	return (
		<nav
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				zIndex: 50,
				padding: "18px 32px",
				background: "transparent",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			{/* Left group: logo + wordmark. */}
			<div style={{ display: "flex", alignItems: "center" }}>
				<Logo />
				<span
					style={{
						fontFamily: '"Inter Tight", sans-serif',
						fontSize: 18,
						fontWeight: 600,
						color: "#111111",
						marginLeft: 10,
						letterSpacing: "-0.2px",
					}}
				>
					Pallet Ross
				</span>
			</div>

			{/* Center group: text buttons. */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<TextButton>Get Started</TextButton>
				<TextButton dot>Create strategy</TextButton>
				{NAV_TRAILING.map((n) => (
					<TextButton key={n}>{n}</TextButton>
				))}
			</div>

			{/* Right group: icon buttons. */}
			<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
				<IconButton label="Account">
					<User size={20} color="#111111" />
				</IconButton>
				<IconButton label="Settings">
					<Settings size={20} color="#111111" />
				</IconButton>
			</div>
		</nav>
	);
}
