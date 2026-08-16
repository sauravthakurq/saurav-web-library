import AIIntelligence from "../components/AIIntelligence";
import Analytics from "../components/Analytics";
import Hero from "../components/Hero";

export default function Index() {
	return (
		<main style={{ background: "#000" }}>
			<Hero />
			<Analytics />
			<AIIntelligence />
		</main>
	);
}
