import { MotionConfig } from "framer-motion";
import React from "react";
import ReactDOM from "react-dom/client";
import Index from "./pages/Index";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<MotionConfig reducedMotion="user">
			<Index />
		</MotionConfig>
	</React.StrictMode>,
);
