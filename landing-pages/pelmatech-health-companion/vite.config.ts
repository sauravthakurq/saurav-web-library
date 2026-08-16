import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 5173,
	},
	// Pre-bundle all runtime deps at server start so Vite never triggers a
	// mid-session re-optimization full-page reload (which would otherwise
	// interrupt automated screen recording).
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"react-dom/client",
			"motion/react",
			"lucide-react",
			"@tanstack/react-query",
			"clsx",
			"tailwind-merge",
			"class-variance-authority",
		],
	},
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});
