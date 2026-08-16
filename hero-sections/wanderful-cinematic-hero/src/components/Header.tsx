const NAV_LINKS = ["JOURNEY", "BENEFITS", "JOURNAL", "GUIDEBOOK"] as const;

export default function Header() {
	return (
		<header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-10 py-8">
			<a href="/" className="text-[17px] font-semibold tracking-tight">
				Wanderful<sup>TM</sup>
			</a>

			<nav className="liquid-glass hidden items-center gap-1 rounded-full px-2 py-2 md:flex">
				{NAV_LINKS.map((link) => (
					<a
						key={link}
						href={`#${link.toLowerCase()}`}
						className="rounded-full px-4 py-1.5 text-[11px] font-medium tracking-[0.12em] text-white/90 transition-colors duration-200 hover:text-white"
					>
						{link}
					</a>
				))}
			</nav>

			<a
				href="#get-roaming"
				className="liquid-glass rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/90 transition-colors duration-200 hover:text-white"
			>
				GET ROAMING
			</a>
		</header>
	);
}
