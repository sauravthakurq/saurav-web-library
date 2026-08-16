/**
 * Reusable fade-up entrance shared by every section.
 * Spread onto a `motion.*` element: `<motion.div {...fadeUp(0.1)} />`
 */
export const fadeUp = (delay: number) => ({
	initial: { opacity: 0, y: 20 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: "-100px" },
	transition: { duration: 0.6, delay, ease: "easeOut" },
});
