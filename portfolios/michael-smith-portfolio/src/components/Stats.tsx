import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Stat {
	value: number;
	suffix: string;
	label: string;
}

const STATS: Stat[] = [
	{ value: 20, suffix: "+", label: "Years Experience" },
	{ value: 95, suffix: "+", label: "Projects Done" },
	{ value: 200, suffix: "%", label: "Satisfied Clients" },
];

const COUNT_DURATION = 1600;

const StatValue = ({ value, suffix }: { value: number; suffix: string }) => {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "-80px" });
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		if (!inView) return;
		let raf: number;
		let start: number | null = null;

		const tick = (now: number) => {
			if (start === null) start = now;
			const progress = Math.min((now - start) / COUNT_DURATION, 1);
			const eased = 1 - (1 - progress) ** 3;
			setDisplay(Math.round(eased * value));
			if (progress < 1) raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [inView, value]);

	return (
		<span
			ref={ref}
			className="font-display text-6xl tabular-nums leading-none text-text-primary md:text-7xl lg:text-8xl"
		>
			{display}
			<span className="font-display italic">{suffix}</span>
		</span>
	);
};

const Stats = () => (
	<section id="resume" className="bg-bg py-16 md:py-24">
		<div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
			<div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-stroke">
				{STATS.map((stat, i) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{
							duration: 0.8,
							delay: i * 0.12,
							ease: [0.25, 0.1, 0.25, 1],
						}}
						className="flex flex-col items-center gap-4 text-center sm:px-8"
					>
						<StatValue value={stat.value} suffix={stat.suffix} />
						<span className="text-xs uppercase tracking-[0.3em] text-muted">
							{stat.label}
						</span>
					</motion.div>
				))}
			</div>
		</div>
	</section>
);

export default Stats;
