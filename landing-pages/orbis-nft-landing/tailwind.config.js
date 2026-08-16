/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				background: "#010828",
				cream: "#EFF4FF",
				neon: "#6FFF00",
			},
			fontFamily: {
				grotesk: ["Anton", "sans-serif"],
				condiment: ["Condiment", "cursive"],
			},
		},
	},
	plugins: [],
};
