import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					"PP Neue Montreal",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Helvetica Neue",
					"Arial",
					"sans-serif",
				],
				serif: ["PP Mondwest", "Georgia", "serif"],
			},
		},
	},
	plugins: [],
} satisfies Config;
