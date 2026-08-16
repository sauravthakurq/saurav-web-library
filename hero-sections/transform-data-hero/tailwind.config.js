/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				schibsted: ['"Schibsted Grotesk"', "sans-serif"],
				inter: ["Inter", "sans-serif"],
				noto: ['"Noto Sans"', "sans-serif"],
				fustat: ["Fustat", "sans-serif"],
			},
			colors: {
				ink: "#000000",
				"gray-mid": "#505050",
				"gray-soft": "#f8f8f8",
				"badge-dark": "#0e1311",
			},
		},
	},
	plugins: [],
};
