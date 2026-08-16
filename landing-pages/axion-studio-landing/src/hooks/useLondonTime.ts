import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
	timeZone: "Europe/London",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

function londonTime(): string {
	return formatter.format(new Date());
}

/** Live London wall-clock time in HH:MM, updated every second. */
export default function useLondonTime(): string {
	const [time, setTime] = useState(londonTime);

	useEffect(() => {
		const id = window.setInterval(() => setTime(londonTime()), 1000);
		return () => window.clearInterval(id);
	}, []);

	return time;
}
