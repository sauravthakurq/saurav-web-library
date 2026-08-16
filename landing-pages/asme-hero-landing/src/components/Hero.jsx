import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const PLACEHOLDER_PROMPT = "Enter Your Email Here For Early Access";
const PLACEHOLDER_CONFIRM = "You Will Receive Notifications By Email";
const TYPE_INTERVAL_MS = 60;
const RESET_DELAY_MS = 4000;

export default function Hero() {
	const [showForm, setShowForm] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [email, setEmail] = useState("");
	const [placeholder, setPlaceholder] = useState("");

	// Typewriter effect for the input placeholder.
	useEffect(() => {
		if (!showForm) {
			setPlaceholder("");
			return undefined;
		}

		const target = submitted ? PLACEHOLDER_CONFIRM : PLACEHOLDER_PROMPT;
		setPlaceholder("");
		let index = 0;
		const interval = setInterval(() => {
			index += 1;
			setPlaceholder(target.slice(0, index));
			if (index >= target.length) clearInterval(interval);
		}, TYPE_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [showForm, submitted]);

	// After submission, return to the button state.
	useEffect(() => {
		if (!submitted) return undefined;

		const timeout = setTimeout(() => {
			setShowForm(false);
			setSubmitted(false);
			setEmail("");
		}, RESET_DELAY_MS);

		return () => clearTimeout(timeout);
	}, [submitted]);

	const handleSubmit = (event) => {
		event.preventDefault();
		if (submitted || !email.trim()) return;
		setSubmitted(true);
		setEmail("");
	};

	return (
		<section className="relative flex-1 flex flex-col items-center justify-center px-6">
			<div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center w-full gap-12">
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-white/80 text-[10px] md:text-[11px] font-medium tracking-[0.2em] uppercase mb-4"
				>
					Build a no-code AI app in minutes
				</motion.p>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
					style={{ fontFamily: "'Instrument Serif', serif" }}
					className="text-4xl md:text-[64px] font-medium tracking-[-0.01em] leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent max-w-4xl"
				>
					A new way to think and create <br className="hidden md:block" />
					with computers
				</motion.h1>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="min-h-[50px] mt-2 w-full flex items-center justify-center"
				>
					<AnimatePresence mode="wait">
						{showForm ? (
							<motion.form
								key="email-form"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.2 }}
								onSubmit={handleSubmit}
								className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 text-[14px] font-medium border border-white/20 rounded-full bg-white/[0.02] backdrop-blur-sm w-full max-w-[320px] focus-within:border-white/40 transition-colors duration-300"
							>
								<input
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder={placeholder}
									readOnly={submitted}
									aria-label="Email address"
									className="flex-1 min-w-0 bg-transparent text-white placeholder-white/45 outline-none"
								/>
								<button
									type="submit"
									aria-label={submitted ? "Email submitted" : "Submit email"}
									className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors duration-300 cursor-pointer"
								>
									{submitted ? (
										<Check className="w-4 h-4" />
									) : (
										<ArrowRight className="w-4 h-4" />
									)}
								</button>
							</motion.form>
						) : (
							<motion.button
								key="cta-button"
								type="button"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.2 }}
								onClick={() => setShowForm(true)}
								className="px-10 py-3 text-[14px] font-medium border border-white/10 rounded-full hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300 text-white/90 backdrop-blur-sm cursor-pointer"
							>
								Get early access
							</motion.button>
						)}
					</AnimatePresence>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.8 }}
				>
					<button
						type="button"
						className="text-white/80 hover:text-white/40 transition-colors duration-300 text-[13px] font-medium tracking-wide cursor-pointer"
					>
						Play Video Demo
					</button>
				</motion.div>
			</div>
		</section>
	);
}
