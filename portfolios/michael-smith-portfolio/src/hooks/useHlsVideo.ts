import type Hls from "hls.js";
import { useEffect, useRef } from "react";

/**
 * Attaches an HLS stream to a <video> element.
 * hls.js is loaded lazily (it is ~0.5 MB) and used where MSE is available,
 * falling back to native HLS support (Safari) otherwise.
 */
export function useHlsVideo(src: string) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		let hls: Hls | null = null;
		let cancelled = false;

		const setup = async () => {
			const { default: HlsLib } = await import("hls.js");
			if (cancelled) return;

			if (HlsLib.isSupported()) {
				hls = new HlsLib({ enableWorker: true });
				hls.loadSource(src);
				hls.attachMedia(video);
			} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = src;
			}
		};

		void setup();

		return () => {
			cancelled = true;
			hls?.destroy();
		};
	}, [src]);

	return videoRef;
}

export const HERO_STREAM =
	"https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";
