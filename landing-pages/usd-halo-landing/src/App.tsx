import BackedBySection from "./components/BackedBySection";
import HeroSection from "./components/HeroSection";
import InfoSection from "./components/InfoSection";
import Navbar from "./components/Navbar";
import UseCasesSection from "./components/UseCasesSection";

export default function App() {
	return (
		<div className="flex flex-col bg-[#F5F5F5]">
			<div className="relative h-screen flex flex-col overflow-hidden">
				<Navbar />
				<HeroSection />
			</div>
			<InfoSection />
			<BackedBySection />
			<UseCasesSection />
		</div>
	);
}
