/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				instrument: ["'Instrument Serif'", "serif"],
			},
		},
	},
	plugins: [],
};
