import { motion } from "framer-motion";
import type Hls from "hls.js";
import { useEffect, useRef } from "react";

import { LogoMark } from "@/components/Logo";
import { fadeUp } from "@/lib/motion";

const HLS_SRC =
	"https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export function CtaSection() {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		let hls: Hls | undefined;
		let cancelled = false;

		// hls.js is heavy, so it is loaded on demand and kept out of the main chunk.
		void import("hls.js").then(({ default: HlsModule }) => {
			if (cancelled) return;

			if (HlsModule.isSupported()) {
				hls = new HlsModule();
				hls.loadSource(HLS_SRC);
				hls.attachMedia(video);
				return;
			}

			// Safari plays HLS natively.
			if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = HLS_SRC;
			}
		});

		return () => {
			cancelled = true;
			hls?.destroy();
		};
	}, []);

	return (
		<section className="relative overflow-hidden border-t border-border/30 py-32 md:py-44">
			<video
				ref={videoRef}
				className="absolute inset-0 z-0 h-full w-full object-cover"
				autoPlay
				loop
				muted
				playsInline
				aria-hidden
			/>
			<div className="absolute inset-0 z-[1] bg-background/45" />

			<div className="relative z-10 flex flex-col items-center px-6 text-center">
				<motion.div {...fadeUp(0)}>
					<LogoMark outerClassName="h-10 w-10" innerClassName="h-5 w-5" />
				</motion.div>

				<motion.h2
					{...fadeUp(0.1)}
					className="mt-8 text-5xl font-medium tracking-[-2px] md:text-7xl"
				>
					Start Your <em className="font-serif font-normal italic">Journey</em>
				</motion.h2>

				<motion.p
					{...fadeUp(0.2)}
					className="mt-5 max-w-md text-lg text-muted-foreground"
				>
					One feed for readers. One home for writers. Zero noise for everyone.
				</motion.p>

				<motion.div
					{...fadeUp(0.3)}
					className="mt-10 flex flex-col gap-4 sm:flex-row"
				>
					<motion.a
						href="#home"
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.98 }}
						className="rounded-lg bg-foreground px-8 py-3.5 text-sm font-semibold text-background"
					>
						Subscribe Now
					</motion.a>
					<motion.a
						href="#use-cases"
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.98 }}
						className="liquid-glass rounded-lg px-8 py-3.5 text-sm font-semibold text-foreground"
					>
						Start Writing
					</motion.a>
				</motion.div>
			</div>
		</section>
	);
}
