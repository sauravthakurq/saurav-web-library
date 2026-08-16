import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import GradientRingButton from "./GradientRingButton";

gsap.registerPlugin(ScrollTrigger);

interface Exploration {
	title: string;
	image: string;
	rotate: string;
}

const ITEMS: Exploration[] = [
	{
		title: "Chromatic study 01",
		image: "/assets/unsplash-photo-1541701494587-cb58502866ab.jpg",
		rotate: "rotate-3",
	},
	{
		title: "Dark matter",
		image: "/assets/unsplash-photo-1550684376-efcbd6e3f031.jpg",
		rotate: "-rotate-2",
	},
	{
		title: "Glass refraction",
		image: "/assets/unsplash-photo-1557672172-298e090bd0f1.jpg",
		rotate: "rotate-1",
	},
	{
		title: "Soft geometry",
		image: "/assets/unsplash-photo-1618005182384-a83a8bd57fbe.jpg",
		rotate: "-rotate-3",
	},
	{
		title: "Field lines",
		image: "/assets/unsplash-photo-1620121692029-d088224ddc74.jpg",
		rotate: "rotate-2",
	},
	{
		title: "Liquid light",
		image: "/assets/unsplash-photo-1604076913837-52ab5629fba9.jpg",
		rotate: "-rotate-1",
	},
];

const COLUMN_ONE = ITEMS.filter((_, i) => i % 2 === 0);
const COLUMN_TWO = ITEMS.filter((_, i) => i % 2 === 1);

const Explorations = () => {
	const sectionRef = useRef<HTMLElement>(null);
	const pinRef = useRef<HTMLDivElement>(null);
	const colOneRef = useRef<HTMLDivElement>(null);
	const colTwoRef = useRef<HTMLDivElement>(null);
	const [lightbox, setLightbox] = useState<Exploration | null>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			// Pin the centre content while the gallery scrolls past it.
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top top",
				end: "bottom bottom",
				pin: pinRef.current,
				pinSpacing: false,
			});

			// Scroll-driven parallax: each column drifts at its own speed.
			const parallax = (
				target: HTMLDivElement | null,
				from: number,
				to: number,
			) =>
				gsap.fromTo(
					target,
					{ y: from },
					{
						y: to,
						ease: "none",
						scrollTrigger: {
							trigger: sectionRef.current,
							start: "top bottom",
							end: "bottom top",
							scrub: true,
						},
					},
				);

			parallax(colOneRef.current, 80, -340);
			parallax(colTwoRef.current, 260, -620);
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	// Close lightbox on Escape.
	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setLightbox(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [lightbox]);

	return (
		<section ref={sectionRef} className="relative min-h-[300vh] bg-bg">
			{/* Layer 1 — pinned centre */}
			<div
				ref={pinRef}
				className="z-10 flex h-screen flex-col items-center justify-center px-6 text-center"
			>
				<div className="mb-5 flex items-center justify-center gap-4">
					<span aria-hidden className="h-px w-8 bg-stroke" />
					<span className="text-xs uppercase tracking-[0.3em] text-muted">
						Explorations
					</span>
					<span aria-hidden className="h-px w-8 bg-stroke" />
				</div>
				<h2 className="mb-4 text-4xl tracking-tight text-text-primary md:text-5xl">
					Visual <span className="font-display italic">playground</span>
				</h2>
				<p className="mb-10 max-w-md text-sm text-muted md:text-base">
					Off-hours experiments in colour, form, and motion — unfiltered and
					unfinished on purpose.
				</p>
				<GradientRingButton
					variant="pill"
					href="https://dribbble.com"
					target="_blank"
					rel="noreferrer"
				>
					Follow on Dribbble
					<span
						aria-hidden
						className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
					>
						↗
					</span>
				</GradientRingButton>
			</div>

			{/* Layer 2 — parallax columns */}
			<div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
				<div className="mx-auto grid h-full max-w-[1400px] grid-cols-2 gap-12 px-6 md:gap-40 md:px-12">
					<div
						ref={colOneRef}
						className="flex flex-col items-end gap-20 pt-[35vh] md:gap-32"
					>
						{COLUMN_ONE.map((item) => (
							<GalleryCard key={item.title} item={item} onOpen={setLightbox} />
						))}
					</div>
					<div
						ref={colTwoRef}
						className="flex flex-col items-start gap-20 pt-[70vh] md:gap-32"
					>
						{COLUMN_TWO.map((item) => (
							<GalleryCard key={item.title} item={item} onOpen={setLightbox} />
						))}
					</div>
				</div>
			</div>

			{/* Lightbox */}
			<AnimatePresence>
				{lightbox && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						onClick={() => setLightbox(null)}
						className="fixed inset-0 z-[200] flex items-center justify-center bg-bg/90 p-6 backdrop-blur-xl"
						role="dialog"
						aria-modal="true"
						aria-label={lightbox.title}
					>
						<motion.figure
							initial={{ scale: 0.92, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
							onClick={(e) => e.stopPropagation()}
							className="flex max-w-3xl flex-col items-center gap-5"
						>
							<img
								src={lightbox.image}
								alt={lightbox.title}
								className="max-h-[75vh] w-auto rounded-3xl border border-stroke object-contain"
							/>
							<figcaption className="flex items-center gap-4 text-sm text-muted">
								<span className="font-display text-lg italic text-text-primary">
									{lightbox.title}
								</span>
								Click anywhere to close
							</figcaption>
						</motion.figure>
						<button
							onClick={() => setLightbox(null)}
							aria-label="Close lightbox"
							className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-stroke bg-surface text-text-primary transition-transform duration-300 hover:rotate-90"
						>
							✕
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
};

const GalleryCard = ({
	item,
	onOpen,
}: {
	item: Exploration;
	onOpen: (item: Exploration) => void;
}) => (
	<button
		onClick={() => onOpen(item)}
		aria-label={`Open ${item.title}`}
		className={`group pointer-events-auto block w-full max-w-[320px] ${item.rotate} transition-transform duration-500 hover:rotate-0`}
	>
		<span className="block aspect-square overflow-hidden rounded-3xl border border-stroke bg-surface shadow-2xl shadow-black/40">
			<img
				src={item.image}
				alt={item.title}
				loading="lazy"
				className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
			/>
		</span>
	</button>
);

export default Explorations;
