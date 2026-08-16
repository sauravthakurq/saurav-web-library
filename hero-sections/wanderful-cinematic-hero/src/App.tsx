import { useEffect, useState } from "react";
import BottomBlock from "./components/BottomBlock";
import Header from "./components/Header";
import HeroHeadline from "./components/HeroHeadline";
import VideoBackground from "./components/VideoBackground";

export default function App() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Double rAF guarantees the pre-transition styles are painted first,
		// so the opacity/translate transition reliably plays on mount.
		let raf2 = 0;
		const raf1 = requestAnimationFrame(() => {
			raf2 = requestAnimationFrame(() => setMounted(true));
		});
		return () => {
			cancelAnimationFrame(raf1);
			cancelAnimationFrame(raf2);
		};
	}, []);

	return (
		<div
			className="min-h-screen overflow-x-hidden bg-black text-white"
			style={{ fontFamily: "'Inter', sans-serif" }}
		>
			<VideoBackground />
			<Header />
			<main>
				<HeroHeadline mounted={mounted} />
				<BottomBlock mounted={mounted} />
			</main>
		</div>
	);
}
