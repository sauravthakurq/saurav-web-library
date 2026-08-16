import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Explorations from "../components/Explorations";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Journal from "../components/Journal";
import LoadingScreen from "../components/LoadingScreen";
import Navbar from "../components/Navbar";
import PageTransition from "../components/PageTransition";
import SelectedWorks from "../components/SelectedWorks";
import Stats from "../components/Stats";

const Index = () => {
	const [isLoading, setIsLoading] = useState(true);

	// Lock scrolling while the loading screen is up.
	useEffect(() => {
		document.body.style.overflow = isLoading ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isLoading]);

	return (
		<PageTransition>
			<AnimatePresence>
				{isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
			</AnimatePresence>

			<Navbar />
			<main>
				<Hero active={!isLoading} />
				<SelectedWorks />
				<Journal />
				<Explorations />
				<Stats />
			</main>
			<Footer />
		</PageTransition>
	);
};

export default Index;
