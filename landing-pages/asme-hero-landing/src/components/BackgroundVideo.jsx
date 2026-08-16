import Hls from "hls.js";
import { useEffect, useRef } from "react";

const VIDEO_SRC =
	"https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8";

export default function BackgroundVideo() {
	const videoRef = useRef(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return undefined;

		if (video.canPlayType("application/vnd.apple.mpegurl")) {
			video.src = VIDEO_SRC;
			return undefined;
		}

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(VIDEO_SRC);
			hls.attachMedia(video);
			return () => hls.destroy();
		}

		return undefined;
	}, []);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<video
				ref={videoRef}
				autoPlay
				muted
				loop
				playsInline
				className="w-full h-full object-cover opacity-100"
			/>
		</div>
	);
}
