import HeroHeader from "./components/HeroHeader";
import Navbar from "./components/Navbar";
import SearchBox from "./components/SearchBox";
import VideoBackground from "./components/VideoBackground";

export default function App() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-gray-soft">
			<VideoBackground />

			{/* All content sits above the full-screen video background. */}
			<div className="relative z-10 flex min-h-screen flex-col">
				<Navbar />

				{/* 60px gap below the nav; content nudged up 50px per spec. */}
				<main className="mt-[60px] flex flex-col items-center px-6 md:px-12 xl:px-[120px]">
					<div className="-mt-[50px] flex w-full flex-col items-center">
						<HeroHeader />
						<SearchBox />
					</div>
				</main>
			</div>
		</div>
	);
}
