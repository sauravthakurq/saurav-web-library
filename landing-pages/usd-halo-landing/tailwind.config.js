/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			// The spec calls for font-medium (600) as the heaviest weight on the
			// page, matching the TT Norms Pro semibold face loaded via @font-face.
			fontWeight: {
				medium: "600",
			},
		},
	},
	plugins: [],
};
