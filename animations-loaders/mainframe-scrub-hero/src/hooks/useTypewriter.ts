import { useEffect, useState } from "react";

export interface TypewriterState {
	displayed: string;
	done: boolean;
}

/**
 * Iteratively reveals `text` slice by slice, like a typewriter.
 *
 * @param text       Full string to type out (may contain newlines).
 * @param speed      Milliseconds between characters.
 * @param startDelay Milliseconds to wait before typing begins.
 */
export function useTypewriter(
	text: string,
	speed = 38,
	startDelay = 600,
): TypewriterState {
	const [displayed, setDisplayed] = useState("");
	const [done, setDone] = useState(false);

	useEffect(() => {
		setDisplayed("");
		setDone(false);

		let interval: ReturnType<typeof setInterval> | undefined;
		const timeout = setTimeout(() => {
			let index = 0;
			interval = setInterval(() => {
				index += 1;
				setDisplayed(text.slice(0, index));
				if (index >= text.length) {
					clearInterval(interval);
					setDone(true);
				}
			}, speed);
		}, startDelay);

		return () => {
			clearTimeout(timeout);
			if (interval !== undefined) clearInterval(interval);
		};
	}, [text, speed, startDelay]);

	return { displayed, done };
}
