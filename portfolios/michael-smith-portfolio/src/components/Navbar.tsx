import { useEffect, useState } from "react";

const NAV_LINKS = [
	{ label: "Home", href: "#home" },
	{ label: "Work", href: "#work" },
	{ label: "Resume", href: "#resume" },
];

const Divider = () => (
	<span aria-hidden className="mx-1 hidden h-5 w-px bg-stroke sm:block" />
);

const Navbar = () => {
	const [scrolled, setScrolled] = useState(false);
	const [active, setActive] = useState("#home");

	useEffect(() => {
		const onScroll = () => {
			setScrolled(window.scrollY > 100);

			// Scroll-spy: the last nav section whose top has crossed 40% of the viewport wins.
			const probe = window.scrollY + window.innerHeight * 0.4;
			let current = "#home";
			for (const link of NAV_LINKS) {
				const el = document.querySelector<HTMLElement>(link.href);
				if (el && el.offsetTop <= probe) current = link.href;
			}
			setActive(current);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
			<nav
				aria-label="Primary"
				className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-2 py-2 backdrop-blur-md transition-shadow duration-500 ${
					scrolled ? "shadow-md shadow-black/10" : ""
				}`}
			>
				{/* Logo — gradient ring that reverses direction on hover */}
				<a
					href="#home"
					aria-label="Michael Smith — home"
					className="group relative mr-1 flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-300 hover:scale-110"
				>
					<span
						aria-hidden
						className="accent-gradient absolute inset-0 rounded-full"
					/>
					<span
						aria-hidden
						className="accent-gradient-reverse absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					/>
					<span className="relative flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center rounded-full bg-bg font-display text-[13px] italic text-text-primary">
						JA
					</span>
				</a>

				<Divider />

				{NAV_LINKS.map((link) => (
					<a
						key={link.href}
						href={link.href}
						className={`rounded-full px-3 py-1.5 text-xs transition-colors duration-300 sm:px-4 sm:py-2 sm:text-sm ${
							active === link.href
								? "bg-stroke/50 text-text-primary"
								: "text-muted hover:bg-stroke/50 hover:text-text-primary"
						}`}
					>
						{link.label}
					</a>
				))}

				<Divider />

				{/* Say hi — gradient ring on hover */}
				<a
					href="mailto:hello@michaelsmith.com"
					className="group relative ml-1 inline-flex"
				>
					<span
						aria-hidden
						className="accent-gradient-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					/>
					<span className="relative inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-text-primary backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
						Say hi
						<span
							aria-hidden
							className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
						>
							↗
						</span>
					</span>
				</a>
			</nav>
		</header>
	);
};

export default Navbar;
