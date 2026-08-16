import { useEffect } from "react";
import Hero from "../components/synex/Hero";

/**
 * Page entry for the Synex hero.
 *
 * Renders <Hero /> inside a <main> with an sr-only <h1> for SEO. The visible
 * headline is split across two styled lines inside Hero, so the semantic,
 * crawler-facing heading lives here as a single accessible string.
 */
export default function Index() {
	useEffect(() => {
		document.title = "Synex — A New Standard in Wealth Management";
		const desc =
			"Take full control of your assets with a unified platform for investing, tracking, and growing your portfolio in real time.";
		let meta = document.querySelector<HTMLMetaElement>(
			'meta[name="description"]',
		);
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content = desc;
	}, []);

	return (
		<main>
			<h1 className="sr-only">A New Standard in Wealth Management</h1>
			<Hero />
		</main>
	);
}
