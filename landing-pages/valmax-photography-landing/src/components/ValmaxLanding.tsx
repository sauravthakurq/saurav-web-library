import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowUpRight, Clock3, Instagram, Menu, MoveRight } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import bgFabric from "@/assets/bg-fabric.png";
import bgNikon from "@/assets/bg-nikon.png";
import bgSilhouettes from "@/assets/bg-silhouettes.png";
import ellipseArc from "@/assets/ellipse-arc.png";
import getInTouchBg from "@/assets/get-in-touch-bg.png";
import logo from "@/assets/logo.svg";
import noise from "@/assets/noise.png";
import photoBasketball from "@/assets/photo-basketball.png";
import photoBerries from "@/assets/photo-berries.png";
import photoCamera from "@/assets/photo-camera.png";
import photoCar from "@/assets/photo-car.png";
import photoFieldsBw from "@/assets/photo-fields-bw.png";
import photoFieldsColor from "@/assets/photo-fields-color.png";
import photoGirlGrass from "@/assets/photo-girl-grass.png";
import photoHat from "@/assets/photo-hat.png";
import photoRalphPortrait from "@/assets/photo-ralph-portrait.png";
import photoRed from "@/assets/photo-red.png";
import photoSculptureBw from "@/assets/photo-sculpture-bw.png";
import photoSculptureColor from "@/assets/photo-sculpture-color.png";
import photoTwins from "@/assets/photo-twins.png";
import vectorArrow from "@/assets/Vector.svg";
import IntroSequence from "@/components/IntroSequence";
import LineField from "@/components/LineField";
import StarField from "@/components/StarField";

const EASE = [0.22, 1, 0.36, 1] as const;
const INTRO_DELAY = 2.9;
const MATTE = "bg-[oklch(0.16_0.004_240)]";

const blurIn: Variants = {
	hidden: { opacity: 0, y: 24, filter: "blur(14px)" },
	show: (i = 0) => ({
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 1.1, delay: INTRO_DELAY + i * 0.08, ease: EASE },
	}),
};

const photoIn: Variants = {
	hidden: { opacity: 0, scale: 0.92, filter: "blur(12px)" },
	show: (i = 0) => ({
		opacity: 1,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			duration: 1.2,
			delay: INTRO_DELAY + 0.1 + i * 0.1,
			ease: EASE,
		},
	}),
};

/* ----------------------------- Pinterest icon ----------------------------- */

function PinterestIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 0a12 12 0 0 0-4.4 23.2c-.1-1-.2-2.5 0-3.6l1.5-6.3s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4 .2.7.8 1.4 1.7 1.4 2 0 3.5-2.2 3.5-5.3 0-2.8-2-4.7-4.8-4.7-3.3 0-5.2 2.5-5.2 5 0 1 .4 2 .9 2.6.1.1.1.2.1.3-.1.4-.3 1.1-.3 1.3-.1.2-.2.3-.4.2-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.6-6.9 4 0 7.1 2.8 7.1 6.6 0 4-2.5 7.2-6 7.2-1.2 0-2.3-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.3-1.5 3.1A12 12 0 1 0 12 0z" />
		</svg>
	);
}

/* ------------------------------ Photo with fallback ----------------------- */

function Photo({
	src,
	alt,
	className,
	decorative = false,
}: {
	src: string;
	alt: string;
	className?: string;
	decorative?: boolean;
}) {
	const [failed, setFailed] = useState(false);
	if (failed) {
		return (
			<div
				className={className}
				style={{ backgroundColor: "oklch(0.18 0 0)" }}
				aria-hidden={decorative ? true : undefined}
			/>
		);
	}
	return (
		<img
			src={src}
			alt={alt}
			className={className}
			aria-hidden={decorative ? true : undefined}
			onError={() => setFailed(true)}
		/>
	);
}

/* ------------------------------- Logo with fallback ----------------------- */

function Logo({ className }: { className?: string }) {
	const [failed, setFailed] = useState(false);
	if (failed) {
		return (
			<span
				className={`font-display font-black text-white h-6 leading-6 text-lg ${className ?? ""}`}
			>
				VALMAX
			</span>
		);
	}
	return (
		<img
			src={logo}
			alt="VALMAX"
			className={`h-6 w-auto ${className ?? ""}`}
			onError={() => setFailed(true)}
		/>
	);
}

/* ----------------------------- Decorative bg image ------------------------ */

function DecorImg({
	src,
	className,
	style,
}: {
	src: string;
	className?: string;
	style?: CSSProperties;
}) {
	const [failed, setFailed] = useState(false);
	if (failed) return null;
	return (
		<img
			src={src}
			alt=""
			aria-hidden="true"
			className={className}
			style={style}
			onError={() => setFailed(true)}
		/>
	);
}

/* --------------------------------- TopBar -------------------------------- */

function TopBar() {
	const [open, setOpen] = useState(false);
	return (
		<header
			className="fixed top-0 left-0 right-0 z-50 pt-6 px-6 md:px-10"
			style={{ zIndex: 50 }}
		>
			<div className="flex items-center justify-between gap-4">
				<motion.a
					href="#"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, delay: INTRO_DELAY - 0.2, ease: EASE }}
				>
					<Logo />
				</motion.a>

				{/* Email form (hidden < md). */}
				<motion.form
					onSubmit={(e) => e.preventDefault()}
					className="hidden md:flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md pl-4 pr-2 py-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, delay: INTRO_DELAY - 0.1, ease: EASE }}
				>
					<input
						type="email"
						placeholder="Your email"
						className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none w-44"
					/>
					<button
						type="submit"
						className="group inline-flex items-center gap-2 rounded-lg bg-white text-black text-sm font-medium px-4 py-2 transition hover:bg-white/90"
					>
						Subscribe
						<ArrowUpRight className="w-4 h-4 opacity-70 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
					</button>
				</motion.form>

				{/* Mobile menu trigger + meta cluster. */}
				<motion.div
					className="flex items-center gap-3"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, delay: INTRO_DELAY - 0.1, ease: EASE }}
				>
					<span className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/50">
						<Clock3 className="w-3.5 h-3.5" />
						Mon–Fri
					</span>
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						aria-label="Menu"
						aria-expanded={open}
						className="md:hidden grid place-items-center w-10 h-10 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/[0.06] transition"
					>
						<Menu className="w-5 h-5" />
					</button>
				</motion.div>
			</div>

			{/* Mobile dropdown panel. */}
			{open && (
				<div className="md:hidden mt-3 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden">
					{["Work", "Studio", "Projects", "Contact"].map((label) => (
						<a
							key={label}
							href="#"
							onClick={() => setOpen(false)}
							className="group flex items-center justify-between px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/[0.06] transition"
						>
							{label}
							<ArrowUpRight className="w-4 h-4 opacity-40 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
						</a>
					))}
					<div className="mt-2 px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
						<span>Follow</span>
						<a
							href="#"
							className="inline-flex items-center gap-1.5 hover:text-white transition"
						>
							<Instagram className="w-3.5 h-3.5" />
							Instagram
						</a>
					</div>
				</div>
			)}
		</header>
	);
}

/* ------------------------------- Photo card ------------------------------ */

interface HeroCard {
	src: string;
	alt: string;
	pos: string;
	size: string;
	depth: number;
	badge?: "ig" | "pin";
	album?: boolean;
}

const HERO_CARDS: HeroCard[] = [
	{
		src: photoFieldsBw,
		alt: "Fields",
		pos: "top-[2%] left-[34%]",
		size: "w-[150px] aspect-[4/3]",
		depth: 18,
		badge: "ig",
	},
	{
		src: photoBerries,
		alt: "Berries",
		pos: "top-[2%] right-[2%]",
		size: "w-[260px] aspect-[16/9]",
		depth: 22,
	},
	{
		src: photoBasketball,
		alt: "Athlete",
		pos: "top-[7%] left-[4%]",
		size: "w-[110px] aspect-[3/4]",
		depth: 28,
		badge: "ig",
	},
	{
		src: photoRed,
		alt: "Portrait red",
		pos: "top-[10%] right-[12%]",
		size: "w-[200px] aspect-[3/4]",
		depth: 26,
		badge: "pin",
		album: true,
	},
	{
		src: photoHat,
		alt: "Hat",
		pos: "top-[18%] left-[3%]",
		size: "w-[220px] aspect-[3/4]",
		depth: 20,
		badge: "ig",
	},
	{
		src: photoSculptureBw,
		alt: "Sculpture",
		pos: "bottom-[calc(6%-10px)] left-[calc(34%-90px)]",
		size: "w-[160px] aspect-[4/5]",
		depth: 24,
		badge: "pin",
	},
	{
		src: photoTwins,
		alt: "Twins",
		pos: "bottom-[6%] right-[22%]",
		size: "w-[230px] aspect-[16/10]",
		depth: 22,
	},
];

function HeroPhotoCard({ card, index }: { card: HeroCard; index: number }) {
	return (
		<motion.div
			className={`absolute ${card.pos} ${card.size}`}
			style={{ zIndex: 20 }}
			custom={index}
			variants={photoIn}
			initial="hidden"
			animate="show"
		>
			<div
				className="w-full h-full"
				style={{
					transform: `translate3d(calc(var(--mx) * ${card.depth}px), calc(var(--my) * ${card.depth}px), 0)`,
					transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
				}}
			>
				<div className="group relative w-full h-full overflow-hidden ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
					<Photo
						src={card.src}
						alt={card.alt}
						className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
					/>

					{card.badge && (
						<div className="absolute bottom-2 right-2 w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm grid place-items-center text-white/80">
							{card.badge === "ig" ? (
								<Instagram className="w-3 h-3" />
							) : (
								<PinterestIcon />
							)}
						</div>
					)}

					{card.album && (
						<div className="absolute left-4 bottom-5 pointer-events-none flex items-center gap-2.5">
							<div className="relative grid place-items-center">
								<div className="absolute w-[55px] h-[55px] rounded-full bg-white/30 blur-[10px]" />
								<div className="absolute w-[38px] h-[38px] rounded-full bg-white/50 blur-[4px]" />
								<div className="w-[25px] h-[25px] rounded-full bg-white shadow-[0_0_18px_4px_rgba(255,255,255,0.7)]" />
							</div>
							<div className="grid place-items-center rounded-full bg-black/35 backdrop-blur-md text-white text-[13px] border border-white/15 w-[119px] h-[39px]">
								View album
							</div>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}

/* -------------------------------- RalphHero ------------------------------ */

function RalphHero() {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduced) return;
		const el = ref.current;
		if (!el) return;
		const onMove = (e: MouseEvent) => {
			const mx = e.clientX / window.innerWidth - 0.5;
			const my = e.clientY / window.innerHeight - 0.5;
			el.style.setProperty("--mx", String(mx));
			el.style.setProperty("--my", String(my));
		};
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, []);

	return (
		<section
			ref={ref}
			className={`relative min-h-[110vh] pt-32 pb-24 overflow-hidden ${MATTE}`}
			style={{ ["--mx" as string]: "0", ["--my" as string]: "0" }}
		>
			<StarField count={700} />
			<LineField variant="hero" />

			<DecorImg
				src={noise}
				className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay pointer-events-none"
				style={{ zIndex: 1 }}
			/>

			<DecorImg
				src={ellipseArc}
				className="absolute pointer-events-none opacity-50"
				style={{
					width: 1500,
					top: "10%",
					left: "50%",
					transform: "translateX(-78%)",
					zIndex: 0,
				}}
			/>
			<DecorImg
				src={ellipseArc}
				className="absolute pointer-events-none opacity-50"
				style={{
					width: 1500,
					top: "10%",
					left: "50%",
					transform: "translateX(-22%)",
					zIndex: 0,
				}}
			/>

			<div
				className="absolute left-1/2 -top-40 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.04] blur-3xl pointer-events-none"
				style={{ zIndex: 1 }}
			/>

			{/* Photo collage. */}
			{HERO_CARDS.map((card, i) => (
				<HeroPhotoCard key={card.alt} card={card} index={i} />
			))}

			{/* Center hero block. */}
			<div className="relative z-10 grid place-items-center min-h-[80vh] px-6 text-center max-w-2xl mx-auto">
				<div>
					<motion.h1
						className="font-display font-black text-7xl md:text-[110px] leading-[0.95] tracking-tight"
						custom={1}
						variants={blurIn}
						initial="hidden"
						animate="show"
					>
						RALPH
						<br />
						EDWARDS
					</motion.h1>
					<motion.p
						className="mt-8 text-white/55 text-base md:text-[15px] leading-relaxed max-w-md mx-auto"
						custom={3}
						variants={blurIn}
						initial="hidden"
						animate="show"
					>
						Crafting digital experiences that captivate and inspire. Elevating
						your brand through design and innovation.
					</motion.p>
				</div>
			</div>
		</section>
	);
}

/* ---------------------------- OurPhotographer ---------------------------- */

function OurPhotographer() {
	return (
		<section
			className={`relative px-6 md:px-12 py-32 overflow-hidden ${MATTE}`}
		>
			<StarField count={500} />
			<LineField variant="photographer" />

			<DecorImg
				src={noise}
				className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay pointer-events-none"
				style={{ zIndex: 1 }}
			/>

			<DecorImg
				src={bgFabric}
				className="absolute left-0 top-1/3 w-[280px] md:w-[340px] opacity-[0.13] pointer-events-none select-none"
				style={{ zIndex: 1 }}
			/>
			<DecorImg
				src={bgSilhouettes}
				className="absolute right-0 top-[12%] w-[360px] md:w-[460px] opacity-[0.16] pointer-events-none select-none"
				style={{ zIndex: 1 }}
			/>
			<DecorImg
				src={bgNikon}
				className="absolute right-[4%] bottom-0 w-[280px] md:w-[360px] opacity-[0.14] pointer-events-none select-none"
				style={{ zIndex: 1 }}
			/>

			<div
				className="absolute -left-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none"
				style={{ zIndex: 1 }}
			/>

			<div
				className="relative grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto items-start"
				style={{ zIndex: 2 }}
			>
				{/* Left card. */}
				<motion.div
					className="relative w-full max-w-[440px] justify-self-center md:justify-self-end p-4 pb-20 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]"
					style={{ backgroundColor: "#efeae0" }}
					initial={{ opacity: 0, y: 60, filter: "blur(16px)" }}
					whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 1.2, ease: EASE }}
				>
					<motion.h2
						className="absolute -top-16 md:-top-19 left-[40rem] -translate-x-1/2 font-display font-medium text-4xl md:text-5xl leading-[0.95] uppercase text-white whitespace-nowrap"
						initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
						whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.1, ease: EASE }}
					>
						Our photographer
					</motion.h2>

					<div className="relative">
						<Photo
							src={photoRalphPortrait}
							alt="Ralph Edwards portrait"
							className="w-full aspect-[3/4] object-cover"
						/>
						<div className="absolute bottom-6 left-6 text-black font-display font-black text-2xl leading-none">
							RALPH
							<br />
							EDWARDS
						</div>
					</div>
				</motion.div>

				{/* Right column. */}
				<div className="space-y-8 max-w-xl">
					<motion.h2
						className="font-display font-medium text-4xl md:text-5xl leading-[1.05] uppercase w-[600px] max-w-full mt-[-28px]"
						initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
						whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.1, ease: EASE }}
					>
						will select the
						<br />
						best images and ideas
						<br />
						for you
					</motion.h2>

					<motion.div
						className="space-y-4 text-white/55 text-[15px] leading-relaxed"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1, delay: 0.2, ease: EASE }}
					>
						<p>
							Once upon a time, nestled in a quaint little town, there lived an
							author named Alice. She wasn't your typical writer; her stories
							weren't just ink on paper; they were portals to worlds beyond
							imagination. Alice had a peculiar gift — she could breathe life
							into her characters, making them dance off the pages and into the
							hearts of her readers.
						</p>
						<p>
							Alice's love for storytelling began in her childhood. She would
							spend hours in her attic, surrounded by dusty old books, dreaming
							up adventures for her imaginary friends. As she grew older, her
							passion for writing only intensified. She studied literature at
							university, honing her craft and delving deeper into the mysteries
							of storytelling.
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

/* -------------------------------- AllTypes ------------------------------- */

interface ProjectCard {
	src: string;
	title: string;
	tall: boolean;
	mt: string;
	width: string;
}

const PROJECTS: ProjectCard[] = [
	{
		src: photoCar,
		title: "Company Photo",
		tall: false,
		mt: "md:mt-20",
		width: "w-[216px]",
	},
	{
		src: photoFieldsColor,
		title: "Landscape Series",
		tall: true,
		mt: "md:mt-25",
		width: "w-[220px]",
	},
	{
		src: photoGirlGrass,
		title: "Classy Photo Shoot",
		tall: false,
		mt: "md:mt-10",
		width: "w-[230px]",
	},
	{
		src: photoSculptureColor,
		title: "Photo Brand",
		tall: false,
		mt: "md:mt-4",
		width: "w-[200px]",
	},
];

function AllTypes() {
	return (
		<section
			className={`relative px-6 md:px-12 py-32 overflow-hidden ${MATTE}`}
		>
			<StarField
				count={550}
				ring
				ringCount={260}
				ringRadiusFactor={0.37}
				ringBandWidth={50}
			/>
			<LineField variant="projects" />

			<DecorImg
				src={noise}
				className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay pointer-events-none"
				style={{ zIndex: 1 }}
			/>

			<div className="relative" style={{ zIndex: 2 }}>
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
					<motion.h2
						className="font-display font-black text-5xl md:text-6xl uppercase leading-[0.95]"
						initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
						whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.1, ease: EASE }}
					>
						All types of
						<br />
						projects
					</motion.h2>

					<div className="space-y-6">
						<p className="text-white/55 text-[15px] max-w-md">
							Welcome to the Innovation Hub: Where Ideas Take Shape. Explore the
							Intersection of Creativity and Technology. Dive Into Our Portfolio
							and Witness the Power of Ingenuity.
						</p>
						<button
							type="button"
							className="group flex items-center gap-3 text-sm uppercase tracking-widest text-white/70 hover:text-white transition"
						>
							View the artwork
							<MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
						</button>
					</div>
				</div>

				<div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-start">
					{PROJECTS.map((p, i) => (
						<motion.div
							key={p.title}
							className={`${p.width} max-w-full mx-auto ${p.mt}`}
							initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
							whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							viewport={{ once: true, margin: "-80px" }}
							transition={{ duration: 1.1, delay: i * 0.12, ease: EASE }}
						>
							<div className="group overflow-hidden ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
								<Photo
									src={p.src}
									alt={p.title}
									className={`w-full ${p.tall ? "aspect-[3/4]" : "aspect-[4/5]"} object-cover transition-transform duration-[1500ms] group-hover:scale-110`}
								/>
							</div>
							<div className="text-center space-y-3 mt-4">
								<h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
									{p.title}
								</h3>
								<button
									type="button"
									className="inline-flex items-center gap-2 text-xs text-white/60 border border-white/15 rounded-full px-3 py-1.5 hover:bg-white/5 transition"
								>
									photo shoot
									<span className="w-4 h-4 border border-white/20 rounded-full grid place-items-center">
										<ArrowUpRight className="w-2.5 h-2.5" />
									</span>
								</button>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

/* ---------------------------- MechanicalMarvels -------------------------- */

function MechanicalMarvels() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "end start"],
	});
	const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

	return (
		<div ref={sectionRef}>
			{/* Top block. */}
			<section className="relative px-6 md:px-12 pt-28 pb-12 overflow-hidden">
				<StarField count={450} />
				<LineField variant="marvels" />

				<DecorImg
					src={noise}
					className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay pointer-events-none"
					style={{ zIndex: 1 }}
				/>

				<div className="relative max-w-[1200px] mx-auto" style={{ zIndex: 2 }}>
					<motion.h2
						className="font-display font-medium uppercase text-5xl md:text-[90px] leading-[0.95] tracking-tight"
						initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
						whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 1.2, ease: EASE }}
					>
						Mechanical{" "}
						<span className="inline-flex items-center align-middle">
							<Photo
								src={photoCamera}
								alt="Camera"
								className="h-10 md:h-20 w-auto rounded-md object-cover"
							/>
						</span>{" "}
						Marvels: Unveiling the artistry of automation
					</motion.h2>

					<div className="flex justify-between items-center mt-16 text-xs uppercase tracking-widest text-white/50">
						<button
							type="button"
							className="group inline-flex items-center gap-2 hover:text-white transition"
						>
							View the artwork
							<MoveRight className="w-3.5 h-3.5 -rotate-45 transition-transform group-hover:translate-x-1" />
						</button>
						<button
							type="button"
							className="group inline-flex items-center gap-2 hover:text-white transition"
						>
							Scroll to view more
							<MoveRight className="w-3.5 h-3.5 rotate-90 transition-transform group-hover:translate-y-1" />
						</button>
					</div>
				</div>
			</section>

			{/* Bottom block. */}
			<section className="relative h-[80vh] overflow-hidden">
				<motion.div
					className="absolute inset-x-0 -top-[10%] -bottom-[10%]"
					style={{ y: bgY }}
				>
					<DecorImg src={getInTouchBg} className="w-full h-full object-cover" />
				</motion.div>

				<div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

				<LineField variant="marvelsBottom" />

				<div className="relative h-full grid place-items-center px-6 text-center">
					<div>
						<motion.h3
							className="font-display font-black uppercase text-4xl md:text-7xl leading-[1] tracking-tight"
							initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
							whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ duration: 1.2, ease: EASE }}
						>
							Get in touch to our
							<br />
							<span className="text-lime">Modern maintenance.</span>
						</motion.h3>

						<motion.div
							className="flex items-center justify-center gap-1"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ duration: 1, delay: 0.3, ease: EASE }}
						>
							<button
								type="button"
								className="mt-10 inline-flex items-center bg-white text-black rounded-full px-6 py-2 text-sm font-medium hover:bg-white/90 uppercase transition"
							>
								Get in touch
							</button>
							<span className="w-[18.86px] h-[18.53px] rounded-full border-[1px] border-white mt-[4rem] flex items-center justify-center">
								<VectorArrow />
							</span>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	);
}

function VectorArrow() {
	const [failed, setFailed] = useState(false);
	if (failed) {
		return <ArrowUpRight className="w-[5.86px] h-[5.53px] text-white" />;
	}
	return (
		<img
			src={vectorArrow}
			alt=""
			aria-hidden="true"
			className="w-[5.86px] h-[5.53px]"
			onError={() => setFailed(true)}
		/>
	);
}

/* --------------------------------- Footer -------------------------------- */

function Footer() {
	return (
		<footer className="relative border-t border-white/10 px-6 md:px-12 py-6 flex items-center justify-between text-xs text-white/40">
			<span>All right reserved — 2024</span>
			<a href="#" className="hover:text-white transition">
				Privacy Policy
			</a>
		</footer>
	);
}

/* ------------------------------- Page shell ------------------------------ */

export default function ValmaxLanding() {
	return (
		<>
			<IntroSequence />
			<TopBar />
			<main>
				<RalphHero />
				<OurPhotographer />
				<AllTypes />
				<MechanicalMarvels />
				<Footer />
			</main>
		</>
	);
}
