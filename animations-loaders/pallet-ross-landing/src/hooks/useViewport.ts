import { useEffect, useState } from "react";

export type Viewport = { w: number; h: number };

/** Tracks the live viewport size, updating on resize. */
export function useViewport(): Viewport {
	const [vp, setVp] = useState<Viewport>(() => ({
		w: typeof window === "undefined" ? 1280 : window.innerWidth,
		h: typeof window === "undefined" ? 800 : window.innerHeight,
	}));

	useEffect(() => {
		const onResize = () =>
			setVp({ w: window.innerWidth, h: window.innerHeight });
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	return vp;
}
