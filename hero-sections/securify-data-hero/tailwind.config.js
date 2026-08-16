/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Readex Pro"', "system-ui", "-apple-system", "sans-serif"],
			},
		},
	},
	plugins: [],
};
