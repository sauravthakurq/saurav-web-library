import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const WORDS = ["Design", "Create", "Inspire"];
const COUNT_DURATION = 2700;
const WORD_INTERVAL = 900;
const COMPLETE_DELAY = 400;

interface LoadingScreenProps {
	onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
	const [count, setCount] = useState(0);
	const [wordIndex, setWordIndex] = useState(0);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	// Counter: 000 -> 100 over 2700ms via requestAnimationFrame.
	useEffect(() => {
		let raf: number;
		let timeout: number | undefined;
		let start: number | null = null;

		const tick = (now: number) => {
			if (start === null) start = now;
			const progress = Math.min((now - start) / COUNT_DURATION, 1);
			setCount(Math.round(progress * 100));
			if (progress < 1) {
				raf = requestAnimationFrame(tick);
			} else {
				timeout = window.setTimeout(
					() => onCompleteRef.current(),
					COMPLETE_DELAY,
				);
			}
		};

		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			window.clearTimeout(timeout);
		};
	}, []);

	// Rotating words, cycling every 900ms.
	useEffect(() => {
		const interval = window.setInterval(
			() => setWordIndex((i) => (i + 1) % WORDS.length),
			WORD_INTERVAL,
		);
		return () => window.clearInterval(interval);
	}, []);

	return (
		<motion.div
			exit={{ opacity: 0 }}
			transition={{ duration: 0.6, ease: "easeInOut" }}
			className="fixed inset-0 z-[9999] bg-bg"
			aria-label="Loading"
		>
			<motion.p
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="absolute left-6 top-6 text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-8"
			>
				Portfolio
			</motion.p>

			<div className="flex h-full items-center justify-center">
				<AnimatePresence mode="wait">
					<motion.span
						key={wordIndex}
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -20, opacity: 0 }}
						transition={{ duration: 0.35, ease: "easeOut" }}
						className="font-display text-4xl italic text-text-primary/80 md:text-6xl lg:text-7xl"
					>
						{WORDS[wordIndex]}
					</motion.span>
				</AnimatePresence>
			</div>

			<div className="absolute bottom-6 right-6 md:bottom-8 md:right-10">
				<span className="font-display text-6xl tabular-nums leading-none text-text-primary md:text-8xl lg:text-9xl">
					{String(count).padStart(3, "0")}
				</span>
			</div>

			<div className="absolute inset-x-0 bottom-0 h-[3px] bg-stroke/50">
				<div
					className="accent-gradient h-full w-full origin-left"
					style={{
						transform: `scaleX(${count / 100})`,
						boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)",
					}}
				/>
			</div>
		</motion.div>
	);
};

export default LoadingScreen;
