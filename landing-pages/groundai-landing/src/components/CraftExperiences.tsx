import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { A } from "../lib/assets";

const FONT_HEADING = "'Inter Tight', sans-serif";
const FONT_ACCENT = "'Playfair Display', serif";
const FONT_BODY = "'SF Pro Rounded', system-ui, sans-serif";

/* -------------------------------------------------------------------------- */
/*  Card 1 — Style carousel                                                   */
/* -------------------------------------------------------------------------- */

const PILL_ROW_HEIGHT = 56;
const PILL_GAP = 18;
const ACTIVE_HEIGHT = 80;
const ACTIVE_GAP = 22;

const ITEMS = [
	"Modern Minimalist",
	"Cozy Scandinavian",
	"Rustic Wooden design",
	"Bold Industrial",
	"Coastal Retreat",
	"Japandi Calm",
	"Art Deco Luxe",
];

function Pill({ label, isActive }: { label: string; isActive: boolean }) {
	return (
		<motion.div
			layout
			transition={{ type: "spring", stiffness: 260, damping: 28 }}
			className={
				isActive
					? "w-[calc(100%_-_60px)] mx-[30px] h-[80px] bg-white/25 backdrop-blur-xl rounded-full shadow-xl flex items-center"
					: "w-[261px] h-[56px] px-3 bg-white/15 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-[8.5px]"
			}
			style={isActive ? { padding: 8.5 } : undefined}
		>
			<motion.div
				layoutId={`icon-${label}`}
				className={
					isActive
						? "w-[63px] h-[63px] rounded-full bg-white/30 flex items-center justify-center overflow-hidden shrink-0"
						: "w-[44px] h-[44px] rounded-full bg-white/30 flex items-center justify-center overflow-hidden shrink-0"
				}
			>
				{isActive ? (
					<img src={A.womem} alt="" className="w-full h-full object-cover" />
				) : (
					<div className="w-full h-full rounded-full bg-white/10" />
				)}
			</motion.div>

			<div className="relative flex-1 h-[44px] text-left ml-1">
				<motion.div
					className="absolute inset-0 flex flex-col justify-center"
					animate={{ opacity: isActive ? 1 : 0 }}
					transition={{ duration: 0.3 }}
				>
					<span
						className="text-white text-lg font-medium leading-tight"
						style={{ fontFamily: FONT_BODY }}
					>
						{label}
					</span>
					<span
						className="text-white/70 text-[11px] tracking-[0.15em]"
						style={{ fontFamily: FONT_BODY }}
					>
						GROUNDAI CHOICE
					</span>
				</motion.div>

				<motion.div
					className="absolute inset-0 flex flex-col justify-center gap-1.5"
					animate={{ opacity: isActive ? 0 : 1 }}
					transition={{ duration: 0.3 }}
				>
					<div className="h-2 w-[140px] bg-white/50 rounded-full" />
					<div className="h-2 w-[70px] bg-white/35 rounded-full" />
				</motion.div>
			</div>
		</motion.div>
	);
}

function StyleCarouselCard() {
	const [active, setActive] = useState(2);
	const len = ITEMS.length;

	useEffect(() => {
		const id = setInterval(() => {
			setActive((a) => (a + 1) % len);
		}, 2800);
		return () => clearInterval(id);
	}, []);

	const half = Math.floor(len / 2);

	return (
		<div className="relative flex-1 h-[585px] rounded-3xl overflow-hidden bg-stone-300">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${A.backgroundCard})` }}
			/>
			<div className="absolute inset-0 bg-black/10" />

			{/* top / bottom fade overlays */}
			<div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent z-20" />
			<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent z-20" />

			<div className="absolute inset-0 flex items-center justify-center">
				<div className="relative w-full" style={{ height: ACTIVE_HEIGHT }}>
					{ITEMS.map((item, i) => {
						const diff = ((i - active + len + half) % len) - half;
						const isActive = diff === 0;
						const visible = Math.abs(diff) <= 2;
						const y =
							diff === 0
								? 0
								: diff < 0
									? diff * (PILL_ROW_HEIGHT + PILL_GAP) - ACTIVE_GAP
									: diff * (PILL_ROW_HEIGHT + PILL_GAP) + ACTIVE_GAP;
						const opacity = !visible ? 0 : Math.abs(diff) === 2 ? 0.55 : 1;

						return (
							<motion.div
								key={item}
								animate={{ y, opacity }}
								transition={{
									y: { type: "spring", stiffness: 260, damping: 28 },
									opacity: { type: "tween", ease: "easeInOut", duration: 0.4 },
								}}
								className="absolute left-0 right-0 flex justify-center pointer-events-none"
							>
								<Pill label={item} isActive={isActive} />
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Card 2 — Chat / customer card                                             */
/* -------------------------------------------------------------------------- */

function Skeleton() {
	return (
		<>
			<div className="w-10 h-10 rounded-xl bg-[#FFFFFF54] shrink-0" />
			<div className="ml-[12px] flex-1 flex flex-col gap-[9px] pr-[22px]">
				<div className="h-[6px] w-[31px] bg-[#FFFFFF3D] rounded-full mt-[17px]" />
				<div className="h-[6px] w-[85%] bg-[#FFFFFF3D] rounded-full" />
				<div className="h-[6px] w-[55%] bg-[#FFFFFF3D] rounded-full" />
			</div>
		</>
	);
}

function MorphBubble() {
	const [filled, setFilled] = useState(false);

	useEffect(() => {
		const id = setTimeout(() => setFilled(true), 1100);
		return () => clearTimeout(id);
	}, []);

	return (
		<motion.div
			layout
			animate={{ backgroundColor: filled ? "#9E948B" : "#FAFAFA14" }}
			transition={{ duration: 0.7, ease: "easeOut" }}
			className="mx-[45px] h-[135px] rounded-3xl p-[22px] overflow-hidden relative"
		>
			<AnimatePresence mode="wait">
				{filled ? (
					<motion.div
						key="filled"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.5, delay: 0.15 }}
					>
						<div className="flex items-center gap-[12px] h-[44px]">
							<img
								src={A.womem}
								alt=""
								className="w-[44px] h-[44px] rounded-full object-cover"
							/>
							<span
								className="text-white text-base leading-none"
								style={{ fontFamily: FONT_BODY }}
							>
								Me
							</span>
						</div>
						<p
							className="text-white text-[15px] leading-snug mt-[-9px] ml-[56px]"
							style={{ fontFamily: FONT_BODY }}
						>
							My interior won&apos;t update, any ideas on how to use GroundAI?
						</p>
					</motion.div>
				) : (
					<motion.div
						key="skeleton"
						className="flex items-start"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<Skeleton />
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

function ChatCard() {
	const headingWords = "Engage and delight customers".split(" ");

	return (
		<div className="relative flex-1 h-[585px] rounded-3xl overflow-hidden bg-[#141413] flex flex-col pt-10 pb-10 justify-between">
			<div className="flex-1 flex flex-col justify-center gap-[10px] mb-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.6 }}
					className="mx-[58px] h-[108px] rounded-2xl bg-[#FAFAFA14] flex items-start pt-[22px] pl-[22px] relative"
				>
					<Skeleton />
				</motion.div>

				<MorphBubble />
			</div>

			<div className="flex justify-between items-end pl-[32px] pr-[32px]">
				<div
					className="w-64 text-white text-4xl leading-10"
					style={{ fontFamily: FONT_BODY }}
				>
					{headingWords.map((word, i) => (
						<motion.span
							// eslint-disable-next-line react/no-array-index-key
							key={`${word}-${i}`}
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.4 }}
							transition={{
								delay: 0.5 + i * 0.1,
								duration: 0.5,
								ease: "easeOut",
							}}
							className="inline-block mr-[0.25em]"
						>
							{word}
						</motion.span>
					))}
				</div>

				<div className="flex items-center" style={{ fontFamily: FONT_BODY }}>
					<div className="w-10 h-10 rounded-full border-2 border-[#141413] flex items-center justify-center text-xl bg-[#5F5D4D] text-white z-30">
						01
					</div>
					<div className="w-10 h-10 rounded-full border-2 border-[#141413] flex items-center justify-center text-xl bg-[#252522] text-white/40 -ml-3 z-20">
						2
					</div>
					<div className="w-10 h-10 rounded-full border-2 border-[#141413] flex items-center justify-center text-xl bg-[#252522] text-white/40 -ml-3 z-10">
						3
					</div>
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Card 3 — Adaptable list                                                   */
/* -------------------------------------------------------------------------- */

const ADAPT_ITEMS: { label: string; color: string }[] = [
	{ label: "Style preference", color: "#887C71" },
	{ label: "Room layout rules", color: "#9E948B" },
	{ label: "Furniture & décor choices", color: "#9E948B" },
];

function PlusIcon() {
	return (
		<svg
			className="w-[22px] h-[22px] text-neutral-400"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M12 4.5v15m7.5-7.5h-15" />
		</svg>
	);
}

function AdaptableCard() {
	const descWords =
		"Customize GroundAI to fit your style and needs—whether you want modern minimalism, cozy comfort, or bold luxury.".split(
			" ",
		);

	return (
		<div
			className="relative flex-1 h-[585px] rounded-3xl overflow-hidden flex flex-col px-[33px] pt-[44px] pb-10"
			style={{ backgroundColor: "#9E948B" }}
		>
			<div className="flex flex-col gap-[26px]">
				<h3
					className="text-white text-5xl font-normal leading-[1.05]"
					style={{ fontFamily: FONT_HEADING }}
				>
					It&apos;s completely
					<br />
					adaptable.
				</h3>
				<p
					className="text-white/60 text-lg leading-snug max-w-[340px]"
					style={{ fontFamily: FONT_BODY }}
				>
					{descWords.map((word, i) => (
						<motion.span
							// eslint-disable-next-line react/no-array-index-key
							key={`${word}-${i}`}
							initial={{ opacity: 0, y: 8 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{
								delay: 0.6 + i * 0.04,
								duration: 0.4,
								ease: "easeOut",
							}}
							className="inline-block mr-[5px]"
						>
							{word}
						</motion.span>
					))}
				</p>
			</div>

			<div className="mt-auto z-10 flex flex-col gap-[12px]">
				{ADAPT_ITEMS.map((item, idx) => (
					<motion.div
						key={item.label}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{
							delay: 1.1 + idx * 0.18,
							duration: 0.55,
							ease: "easeOut",
						}}
						className="w-full py-[15px] px-[27px] rounded-2xl bg-white flex items-center justify-between"
					>
						<span
							className="text-lg"
							style={{ color: item.color, fontFamily: FONT_BODY }}
						>
							{item.label}
						</span>
						<PlusIcon />
					</motion.div>
				))}
			</div>

			<div
				className="pointer-events-none absolute inset-x-0 -bottom-10 h-[140px] -mx-4 z-20"
				style={{
					background:
						"linear-gradient(to top, rgba(158,148,139,1) 0%, rgba(158,148,139,1) 35%, rgba(158,148,139,0.7) 65%, rgba(158,148,139,0) 80%)",
				}}
			/>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function CraftExperiences() {
	const cards = [StyleCarouselCard, ChatCard, AdaptableCard];

	return (
		<section className="bg-white">
			<div className="max-w-[1360px] mx-auto px-6 md:px-12 pt-16 pb-20">
				<h2
					className="text-center text-5xl md:text-6xl font-normal leading-[1.1] mb-12 text-neutral-900"
					style={{ fontFamily: FONT_HEADING }}
				>
					<span style={{ fontFamily: FONT_ACCENT, fontStyle: "italic" }}>
						Craft experiences
					</span>{" "}
					your
					<br />
					customers will remember
				</h2>

				<div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
					{cards.map((Card, i) => (
						<motion.div
							// eslint-disable-next-line react/no-array-index-key
							key={i}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ delay: i * 0.35, duration: 1.1, ease: "easeOut" }}
							className="flex flex-1"
						>
							<Card />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
