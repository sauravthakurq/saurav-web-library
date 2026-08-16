import { useEffect, useRef, useState } from "react";

/**
 * Observes an element and flips `inView` to true (once) when at least 10%
 * of it enters the viewport. Pair with `animationClass` for staggered
 * fade-in-up reveals.
 */
export function useInViewAnimation<T extends HTMLElement = HTMLDivElement>() {
	const ref = useRef<T | null>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const animationClass = inView ? "animate-fade-in-up" : "opacity-0";

	return { ref, inView, animationClass };
}
