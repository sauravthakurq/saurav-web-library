import { motion } from "framer-motion";
import { A } from "../lib/assets";

const FONT_ACCENT = "'Playfair Display', serif";
const FONT_BODY = "'SF Pro Rounded', system-ui, sans-serif";
const FONT_BRAND = "'Satoshi', system-ui, sans-serif";

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0 },
};

const QUOTE =
	"GroundAI completely changed how I approached redesigning my apartment. Instead of feeling overwhelmed with choices. It felt like having a designer by my side 24/7.";

export function Testimonials() {
	return (
		<section className="bg-white">
			<div className="max-w-[1360px] mx-auto px-6 md:px-10 py-20">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.25 }}
					transition={{ staggerChildren: 0.18 }}
					className="flex flex-col lg:flex-row justify-between items-stretch gap-8 lg:gap-[25px]"
				>
					{/* left column */}
					<div className="flex flex-col lg:flex-row gap-[25px] items-stretch">
						{/* block A */}
						<motion.div
							variants={fadeUp}
							transition={{ duration: 0.6, ease: "easeOut" }}
							className="flex flex-row lg:flex-col justify-between lg:h-full lg:min-h-[447px] gap-4 lg:gap-8 items-center lg:items-start"
						>
							<div className="flex flex-col gap-6 flex-1 lg:flex-none">
								<h3
									className="text-3xl text-black leading-tight max-w-[260px]"
									style={{ fontFamily: FONT_BODY }}
								>
									<span style={{ fontFamily: FONT_BODY, fontWeight: 500 }}>
										GroundAI
									</span>{" "}
									<span
										style={{ fontFamily: FONT_ACCENT, fontStyle: "italic" }}
									>
										changed my approach
									</span>
								</h3>
								<div className="hidden lg:flex items-center gap-2">
									<div className="w-8 h-2 bg-black rounded-full" />
									<div className="w-2 h-2 bg-stone-300 rounded-full" />
									<div className="w-2 h-2 bg-stone-300 rounded-full" />
								</div>
							</div>

							<motion.button
								type="button"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
								className="self-start bg-black text-white px-7 py-3 rounded-2xl text-xl font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap"
								style={{ fontFamily: FONT_BODY }}
							>
								Read More
							</motion.button>
						</motion.div>

						{/* block B */}
						<motion.div
							variants={fadeUp}
							transition={{ duration: 0.6, ease: "easeOut" }}
							className="flex flex-col gap-3 w-full lg:w-[282px]"
						>
							<div className="w-full h-[280px] lg:h-[351px] rounded-2xl overflow-hidden">
								<img
									src={A.bottomWonem}
									alt="Interior design inspiration"
									className="w-full h-full object-cover"
								/>
							</div>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.4, duration: 0.55, ease: "easeOut" }}
								className="w-full h-24 rounded-2xl flex items-center justify-center gap-3"
								style={{ backgroundColor: "#F1F0EF" }}
							>
								<img src={A.SkodiaSkodia} alt="" className="h-8 w-auto" />
								<span
									className="text-3xl font-bold text-black"
									style={{ fontFamily: FONT_BRAND }}
								>
									Skodia
								</span>
							</motion.div>
						</motion.div>
					</div>

					{/* right column */}
					<motion.div
						variants={fadeUp}
						transition={{ duration: 0.6, ease: "easeOut" }}
						className="max-w-[748px] flex-1 p-10 rounded-2xl flex flex-col justify-between gap-10"
						style={{ backgroundColor: "#7D756E1C" }}
					>
						<p
							className="text-3xl leading-10 text-black"
							style={{ fontFamily: FONT_BODY }}
						>
							{QUOTE.split(" ").map((word, i) => (
								<motion.span
									// eslint-disable-next-line react/no-array-index-key
									key={`${word}-${i}`}
									initial={{ opacity: 0, y: 6 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.35,
										delay: 0.4 + i * 0.04,
										ease: "easeOut",
									}}
									className="inline-block mr-[0.25em]"
								>
									{word}
								</motion.span>
							))}
						</p>

						<motion.div
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
							className="flex flex-col gap-1"
						>
							<span
								className="text-xl text-black"
								style={{ fontFamily: FONT_ACCENT, fontStyle: "italic" }}
							>
								Sophia Martinez,
							</span>
							<span
								className="text-xl text-black/50"
								style={{ fontFamily: FONT_BODY }}
							>
								Homeowner &amp; Interior Design Enthusiast
							</span>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
