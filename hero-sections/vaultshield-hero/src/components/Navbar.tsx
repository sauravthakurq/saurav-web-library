import { Menu } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

const NAV_LINKS = ["Vault", "Plans", "Install", "News", "Help"];

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="relative z-10 mx-auto w-full max-w-[1280px] px-5 py-4 sm:px-8 sm:py-5">
			<div className="flex items-center justify-between">
				<a href="#" aria-label="VaultShield home" className="flex items-center">
					<Logo />
				</a>

				<nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
					{NAV_LINKS.map((link) => (
						<a
							key={link}
							href="#"
							className="text-sm font-medium transition-opacity hover:opacity-60"
							style={{ color: "#192837" }}
						>
							{link}
						</a>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex">
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
				</div>

				<button
					type="button"
					className="rounded-full p-2 transition-opacity hover:opacity-60 md:hidden"
					onClick={() => setMenuOpen(true)}
					aria-label="Open menu"
					aria-expanded={menuOpen}
				>
					<Menu size={26} color="#192837" />
				</button>
			</div>

			<MobileMenu
				open={menuOpen}
				links={NAV_LINKS}
				onClose={() => setMenuOpen(false)}
			/>
		</header>
	);
}
