import { motion, type Variants } from "framer-motion";
import { ArrowRightCircle, Fingerprint, LockKeyhole, Zap } from "lucide-react";
import type { CSSProperties } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
	hidden: { opacity: 0, y: 28 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: i * 0.15, duration: 0.6, ease: EASE },
	}),
};

const inlineIconStyle: CSSProperties = {
	display: "inline",
	verticalAlign: "middle",
	position: "relative",
	top: -2,
};

export default function Hero() {
	return (
		<main className="relative z-10 mx-auto w-full max-w-[1280px] px-5 sm:px-8">
			<div style={{ paddingTop: "clamp(40px, 8vw, 72px)", maxWidth: 560 }}>
				<motion.h1
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					custom={0}
					style={{
						fontFamily: "var(--font-heading)",
						fontSize: "clamp(1.65rem, 5vw, 3rem)",
						lineHeight: 1.05,
						letterSpacing: "-0.01em",
						color: "#192837",
						marginBottom: 24,
					}}
				>
					<Zap
						size={24}
						color="#192837"
						style={inlineIconStyle}
						aria-hidden="true"
					/>{" "}
					Lock Down Your Passwords{" "}
					<LockKeyhole
						size={24}
						color="#192837"
						style={inlineIconStyle}
						aria-hidden="true"
					/>{" "}
					with Ironclad Security{" "}
					<Fingerprint
						size={24}
						color="#192837"
						style={inlineIconStyle}
						aria-hidden="true"
					/>
				</motion.h1>

				{/* Fade runs on the wrapper so the paragraph keeps its 0.8 resting opacity. */}
				<motion.div
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					custom={1}
				>
					<p
						style={{
							fontFamily: "var(--font-body)",
							fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
							lineHeight: 1.65,
							opacity: 0.8,
							maxWidth: 560,
						}}
					>
						Zero stress, total control. VaultShield keeps you covered with
						unbreakable storage, one-tap access, and pro-grade tools for your
						non-stop world.
					</p>
				</motion.div>

				<motion.button
					type="button"
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					custom={2}
					whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
					whileTap={{ scale: 0.96 }}
					className="mt-8 inline-flex items-center justify-between font-semibold"
					style={{
						background: "#7342E2",
						color: "#ffffff",
						borderRadius: 50,
						padding: "17px 24px",
						fontFamily: "var(--font-body)",
						fontSize: "clamp(0.9rem, 2vw, 1rem)",
						boxShadow: "0 4px 24px rgba(115,66,226,0.28)",
						minWidth: 210,
						gap: 32,
					}}
				>
					Get It Free
					<ArrowRightCircle size={20} aria-hidden="true" />
				</motion.button>
			</div>
		</main>
	);
}
