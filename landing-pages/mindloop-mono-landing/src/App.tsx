import { CtaSection } from "@/components/sections/CtaSection";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Navbar } from "@/components/sections/Navbar";
import { SearchChanged } from "@/components/sections/SearchChanged";
import { Solution } from "@/components/sections/Solution";

export default function App() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Navbar />
			<main>
				<Hero />
				<SearchChanged />
				<Mission />
				<Solution />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}
