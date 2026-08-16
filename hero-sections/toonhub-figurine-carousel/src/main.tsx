import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ToonHubHero from "./ToonHubHero";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ToonHubHero />
	</StrictMode>,
);
