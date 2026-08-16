interface HeroHeadlineProps {
	mounted: boolean;
}

export default function HeroHeadline({ mounted }: HeroHeadlineProps) {
	return (
		<h1
			className={`fixed inset-x-0 z-20 px-6 text-center transition-all duration-1000 ${
				mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
			}`}
			style={{
				top: "120px",
				fontFamily: "'Inter', sans-serif",
				fontWeight: 400,
				fontSize: "clamp(40px, 5.4vw, 72px)",
				lineHeight: 1.1,
				letterSpacing: "-0.02em",
			}}
		>
			<span className="block text-white">Venture without edges.</span>
			<span className="block" style={{ color: "rgba(255,255,255,0.55)" }}>
				Uncover with keen instinct.
			</span>
		</h1>
	);
}
