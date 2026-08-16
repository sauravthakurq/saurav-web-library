import gsap from "gsap";
import { useEffect, useRef } from "react";
import { HERO_STREAM, useHlsVideo } from "../hooks/useHlsVideo";
import GradientRingButton from "./GradientRingButton";

const SOCIALS = [
	{ label: "Twitter", href: "https://twitter.com" },
	{ label: "LinkedIn", href: "https://linkedin.com" },
	{ label: "Dribbble", href: "https://dribbble.com" },
	{ label: "GitHub", href: "https://github.com" },
];

const MARQUEE_REPEATS = 10;

const Footer = () => {
	const videoRef = useHlsVideo(HERO_STREAM);
	const marqueeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.to(marqueeRef.current, {
				xPercent: -50,
				duration: 40,
				ease: "none",
				repeat: -1,
			});
		});
		return () => ctx.revert();
	}, []);

	return (
		<footer
			id="contact"
			className="relative overflow-hidden bg-bg pb-8 pt-16 md:pb-12 md:pt-20"
		>
			{/* Background video — hero stream flipped vertically */}
			<div className="absolute inset-0" aria-hidden>
				<video
					ref={videoRef}
					autoPlay
					muted
					loop
					playsInline
					className="absolute left-1/2 top-1/2 h-auto w-auto min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 scale-y-[-1] object-cover"
				/>
				<div className="absolute inset-0 bg-black/60" />
				<div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg to-transparent" />
			</div>

			<div className="relative z-10">
				{/* GSAP marquee */}
				<div className="overflow-hidden border-y border-white/10 py-6 md:py-8">
					<div ref={marqueeRef} className="flex w-max whitespace-nowrap">
						{Array.from({ length: MARQUEE_REPEATS }, (_, i) => (
							<span
								key={i}
								className="px-4 font-display text-5xl italic text-text-primary/90 md:text-7xl"
							>
								BUILDING THE FUTURE{" "}
								<span aria-hidden className="not-italic text-muted">
									•
								</span>{" "}
							</span>
						))}
					</div>
				</div>

				{/* CTA */}
				<div className="mx-auto flex max-w-[1200px] flex-col items-center px-6 py-20 text-center md:py-28">
					<p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
						Got a project in mind?
					</p>
					<h2 className="mb-10 text-4xl tracking-tight text-text-primary md:text-6xl">
						Let's make something{" "}
						<span className="font-display italic">together</span>
					</h2>
					<GradientRingButton
						variant="solid"
						href="mailto:hello@michaelsmith.com"
					>
						hello@michaelsmith.com
						<span aria-hidden>↗</span>
					</GradientRingButton>
				</div>

				{/* Footer bar */}
				<div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 border-t border-white/10 px-6 pt-8 sm:flex-row md:px-10 lg:px-16">
					<nav aria-label="Social links" className="flex items-center gap-5">
						{SOCIALS.map((social) => (
							<a
								key={social.label}
								href={social.href}
								target="_blank"
								rel="noreferrer"
								className="text-sm text-muted transition-colors duration-300 hover:text-text-primary"
							>
								{social.label}
							</a>
						))}
					</nav>

					<div className="flex items-center gap-3">
						<span className="relative flex h-2.5 w-2.5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
						</span>
						<span className="text-sm text-muted">Available for projects</span>
					</div>

					<p className="text-sm text-muted">© 2026 Michael Smith</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
