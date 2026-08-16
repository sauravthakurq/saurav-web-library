import BackgroundVideo from "./components/BackgroundVideo.jsx";
import Hero from "./components/Hero.jsx";
import Navbar from "./components/Navbar.jsx";

export default function App() {
	return (
		<main className="relative bg-black h-screen w-screen flex flex-col overflow-hidden selection:bg-white selection:text-black shrink-0">
			<BackgroundVideo />
			<Navbar />
			<Hero />
		</main>
	);
}
