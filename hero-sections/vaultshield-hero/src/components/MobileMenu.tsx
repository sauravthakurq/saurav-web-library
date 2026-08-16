import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";

const EASE = [0.22, 1, 0.36, 1] as const;

interface MobileMenuProps {
	open: boolean;
	links: string[];
	onClose: () => void;
}

export default function MobileMenu({ open, links, onClose }: MobileMenuProps) {
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	/* Portaled to <body> so the fixed sheet/backdrop escape the header's
     z-10 stacking context and reliably cover the hero content. */
	return createPortal(
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						key="backdrop"
						className="fixed inset-0 z-40"
						style={{
							background: "rgba(25,40,55,0.35)",
							backdropFilter: "blur(4px)",
							WebkitBackdropFilter: "blur(4px)",
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						onClick={onClose}
						aria-hidden="true"
					/>
					<motion.aside
						key="sheet"
						className="fixed right-0 top-0 z-50 flex flex-col"
						style={{
							width: "min(88vw, 360px)",
							height: "100dvh",
							background: "#CFC8C5",
							boxShadow: "-12px 0 48px rgba(25,40,55,0.18)",
						}}
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ duration: 0.45, ease: EASE }}
						role="dialog"
						aria-modal="true"
						aria-label="Mobile navigation"
					>
						<div className="flex items-center justify-between px-6 py-5">
							<Logo />
							<button
								type="button"
								onClick={onClose}
								aria-label="Close menu"
								className="rounded-full p-2 transition-opacity hover:opacity-60"
							>
								<X size={26} color="#192837" />
							</button>
						</div>
						<div style={{ height: 1, background: "rgba(25,40,55,0.15)" }} />
						<nav className="flex flex-1 flex-col gap-1 px-6 pt-6">
							{links.map((link, i) => (
								<motion.a
									key={link}
									href="#"
									className="py-3 text-2xl font-medium transition-opacity hover:opacity-60"
									style={{ color: "#192837" }}
									initial={{ opacity: 0, x: 24 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{
										delay: 0.18 + i * 0.07,
										duration: 0.45,
										ease: EASE,
									}}
								>
									{link}
								</motion.a>
							))}
						</nav>
						<motion.div
							className="flex flex-col gap-3 px-6 pb-8"
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								delay: 0.18 + links.length * 0.07,
								duration: 0.45,
								ease: EASE,
							}}
						>
							<button
								type="button"
								className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
								style={{ background: "#7342E2" }}
							>
								Start For Free
							</button>
							<button
								type="button"
								className="rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
								style={{ background: "#F2F2EE", color: "#192837" }}
							>
								Sign In
							</button>
						</motion.div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>,
		document.body,
	);
}
