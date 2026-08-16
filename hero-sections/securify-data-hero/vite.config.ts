/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	preview: {
		port: 4723,
		strictPort: true,
	},
	test: {
		environment: "jsdom",
		globals: true,
	},
});
