import About from "./components/About";
import Features from "./components/Features";
import Hero from "./components/Hero";

export default function App() {
	return (
		<main className="min-h-screen bg-black">
			<Hero />
			<About />
			<Features />
		</main>
	);
}
