import { useRef } from "react";
import BlurBlobs from "./components/BlurBlobs";
import Navbar from "./components/Navbar";
import ScrollCards from "./components/ScrollCards";
import ScrollIndicator from "./components/ScrollIndicator";
import SectionClass from "./sections/SectionClass";
import SectionEcommerce from "./sections/SectionEcommerce";
import SectionHero from "./sections/SectionHero";

export default function App() {
	const containerRef = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={containerRef}
			style={{
				background: "#F2F2F0",
				position: "relative",
				width: "100%",
				overflowX: "hidden",
			}}
		>
			{/* z0 decoration layer. */}
			<BlurBlobs />

			{/* z50 navbar + z40 scroll indicator. */}
			<Navbar />
			<ScrollIndicator />

			{/* z5 global cards overlay (owns all seven artwork cards). */}
			<ScrollCards containerRef={containerRef} />

			{/* Three full-height sections stacked in the single scroll surface. */}
			<SectionHero />
			<SectionEcommerce />
			<SectionClass />
		</div>
	);
}
