import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { HERO_STREAM, useHlsVideo } from "../hooks/useHlsVideo";
import GradientRingButton from "./GradientRingButton";

const ROLES = ["Creative", "Fullstack", "Founder", "Scholar"];
const ROLE_INTERVAL = 2000;

interface HeroProps {
	/** Entrance timeline waits until the loading screen has cleared. */
	active: boolean;
}

const Hero = ({ active }: HeroProps) => {
	const sectionRef = useRef<HTMLElement>(null);
	const videoRef = useHlsVideo(HERO_STREAM);
	const [roleIndex, setRoleIndex] = useState(0);

	useEffect(() => {
		const interval = window.setInterval(
			() => setRoleIndex((i) => (i + 1) % ROLES.length),
			ROLE_INTERVAL,
		);
		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!active || !sectionRef.current) return;

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
			tl.fromTo(
				".name-reveal",
				{ opacity: 0, y: 50 },
				{ opacity: 1, y: 0, duration: 1.2, delay: 0.1 },
				0,
			);
			tl.fromTo(
				".blur-in",
				{ opacity: 0, y: 20, filter: "blur(10px)" },
				{
					opacity: 1,
					y: 0,
					filter: "blur(0px)",
					duration: 1,
					stagger: 0.1,
					delay: 0.3,
				},
				0,
			);
		}, sectionRef);

		return () => ctx.revert();
	}, [active]);

	return (
		<section
			id="home"
			ref={sectionRef}
			className="relative flex min-h-screen items-center justify-center overflow-hidden"
		>
			{/* Background HLS video */}
			<div className="absolute inset-0" aria-hidden>
				<video
					ref={videoRef}
					autoPlay
					muted
					loop
					playsInline
					className="absolute left-1/2 top-1/2 h-auto w-auto min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
				/>
				<div className="absolute inset-0 bg-black/20" />
				<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
			</div>

			{/* Centered content */}
			<div className="relative z-10 flex flex-col items-center px-6 text-center">
				<p className="blur-in mb-8 text-xs uppercase tracking-[0.3em] text-muted opacity-0">
					Collection '26
				</p>
				<h1 className="name-reveal mb-6 font-display text-6xl italic leading-[0.9] tracking-tight text-text-primary opacity-0 md:text-8xl lg:text-9xl">
					Michael Smith
				</h1>
				<p className="blur-in mb-3 text-base text-muted opacity-0 md:text-lg">
					A{" "}
					<span
						key={roleIndex}
						className="animate-role-fade-in inline-block font-display italic text-text-primary"
					>
						{ROLES[roleIndex]}
					</span>{" "}
					lives in Chicago.
				</p>
				<p className="blur-in mb-12 max-w-md text-sm text-muted opacity-0 md:text-base">
					Designing seamless digital interactions by focusing on the unique
					nuances which bring systems to life.
				</p>
				<div className="blur-in inline-flex gap-4 opacity-0">
					<GradientRingButton variant="solid" href="#work">
						See Works
					</GradientRingButton>
					<GradientRingButton
						variant="outline"
						href="mailto:hello@michaelsmith.com"
					>
						Reach out...
					</GradientRingButton>
				</div>
			</div>

			{/* Scroll indicator */}
			<div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
				<div className="blur-in flex flex-col items-center gap-3 opacity-0">
					<span className="text-xs uppercase tracking-[0.2em] text-muted">
						Scroll
					</span>
					<span className="relative block h-10 w-px overflow-hidden bg-stroke">
						<span className="animate-scroll-down absolute inset-x-0 top-0 h-1/2 bg-text-primary" />
					</span>
				</div>
			</div>
		</section>
	);
};

export default Hero;
