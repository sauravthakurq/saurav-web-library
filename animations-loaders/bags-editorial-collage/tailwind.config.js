/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter Tight", "system-ui", "sans-serif"],
				serif: ["Instrument Serif", "Georgia", "serif"],
			},
		},
	},
	plugins: [],
};
