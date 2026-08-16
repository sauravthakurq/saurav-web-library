/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				tight: ['"Inter Tight"', "system-ui", "sans-serif"],
			},
			colors: {
				paper: "#F2F2F0",
				ink: "#05050C",
			},
		},
	},
	plugins: [],
};
