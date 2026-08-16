/**
 * Fixed full-viewport decoration layer at z-index 0 holding three soft
 * radial-gradient blur blobs. Pointer-events none so they never intercept input.
 */
export default function BlurBlobs() {
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
				pointerEvents: "none",
				overflow: "hidden",
			}}
			aria-hidden
		>
			<div
				style={{
					position: "absolute",
					top: "5%",
					left: "8%",
					width: 300,
					height: 300,
					background:
						"radial-gradient(circle, rgba(180,180,180,0.12) 0%, transparent 70%)",
					filter: "blur(40px)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: "8%",
					right: "10%",
					width: 250,
					height: 250,
					background:
						"radial-gradient(circle, rgba(180,180,180,0.12) 0%, transparent 70%)",
					filter: "blur(40px)",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: "30%",
					left: "50%",
					transform: "translateX(-50%)",
					width: 600,
					height: 400,
					background:
						"radial-gradient(circle, rgba(160,160,160,0.08) 0%, transparent 70%)",
					filter: "blur(60px)",
				}}
			/>
		</div>
	);
}
