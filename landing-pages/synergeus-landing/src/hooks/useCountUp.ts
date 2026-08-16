import { useEffect, useRef, useState } from "react";

const usdFormatter = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

/**
 * Counts a value from `from` to `to` over `duration` ms using a cubic
 * ease-out curve (eased = 1 - (1 - t)^3) once `active` becomes true.
 * Returns the formatted "$x,xxx.xx" string.
 */
export function useCountUp(
	to: number,
	active: boolean,
	from = 0,
	duration = 1200,
) {
	const [value, setValue] = useState(from);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		if (!active) return;

		const start = performance.now();
		const tick = (now: number) => {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - (1 - t) ** 3;
			setValue(from + (to - from) * eased);
			if (t < 1) {
				rafRef.current = requestAnimationFrame(tick);
			}
		};
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [active, to, from, duration]);

	return `$${usdFormatter.format(value)}`;
}
