import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				body: ["Inter", "sans-serif"],
				display: ["'Instrument Serif'", "serif"],
			},
			colors: {
				bg: "hsl(var(--bg) / <alpha-value>)",
				surface: "hsl(var(--surface) / <alpha-value>)",
				"text-primary": "hsl(var(--text) / <alpha-value>)",
				muted: "hsl(var(--muted) / <alpha-value>)",
				stroke: "hsl(var(--stroke) / <alpha-value>)",
			},
		},
	},
	plugins: [animate],
} satisfies Config;
