import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Shared route-level fade/slide transition. */
const PageTransition = ({ children }: { children: ReactNode }) => (
	<motion.div
		initial={{ opacity: 0, y: 12 }}
		animate={{ opacity: 1, y: 0 }}
		exit={{ opacity: 0, y: -12 }}
		transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
	>
		{children}
	</motion.div>
);

export default PageTransition;
