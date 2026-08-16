import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";

// react-router-dom is wired up per the tech stack, though there is no
// router-driven navigation in this view — the Index page renders everything.
export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Index />} />
				<Route path="*" element={<Index />} />
			</Routes>
		</BrowserRouter>
	);
}
