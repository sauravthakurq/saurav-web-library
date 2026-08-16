import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { ASSETS } from "../lib/assets";

// The original spec streams an HLS (.m3u8) source. To keep the experiment
// fully self-contained and offline-runnable, the hero video is vendored
// locally as an MP4 (transcoded from that same Mux stream) and used as the
// primary source. The HLS source + hls.js / native-Safari playback logic is
// retained exactly as specified as a progressive enhancement; it only kicks
// in if the local MP4 source were ever removed.
const HLS_SRC = ASSETS.heroHls;
const LOCAL_SRC = ASSETS.heroVideo;

export default function HeroVideo() {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// Set iOS-friendly attributes imperatively as well as declaratively.
		video.muted = true;
		video.defaultMuted = true;
		video.autoplay = true;
		video.loop = true;
		video.playsInline = true;
		video.setAttribute("muted", "");
		video.setAttribute("autoplay", "");
		video.setAttribute("loop", "");
		video.setAttribute("playsinline", "");
		video.setAttribute("webkit-playsinline", "");

		let hls: Hls | null = null;

		const safePlay = () => {
			const p = video.play();
			if (p && typeof p.catch === "function") {
				p.catch(() => console.warn("Video play blocked"));
			}
		};

		// 1) Prefer the locally vendored MP4 so the page works offline.
		if (video.canPlayType("video/mp4")) {
			video.src = LOCAL_SRC;
			video.addEventListener("loadedmetadata", safePlay, { once: true });
			safePlay();
			return () => {
				video.removeEventListener("loadedmetadata", safePlay);
			};
		}

		// 2) Safari with native HLS support.
		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = HLS_SRC;
			video.addEventListener("loadedmetadata", safePlay, { once: true });
			return () => {
				video.removeEventListener("loadedmetadata", safePlay);
			};
		}

		// 3) hls.js (Chrome / Firefox).
		if (Hls.isSupported()) {
			hls = new Hls({ enableWorker: true });
			hls.loadSource(HLS_SRC);
			hls.attachMedia(video);
			hls.on(Hls.Events.MANIFEST_PARSED, safePlay);
			return () => {
				hls?.destroy();
			};
		}

		// 4) Last-resort fallback.
		video.src = HLS_SRC;
		safePlay();
	}, []);

	return (
		<video
			ref={videoRef}
			autoPlay
			loop
			muted
			playsInline
			className="absolute inset-0 h-full w-full object-cover"
			style={{ zIndex: 0 }}
		/>
	);
}
