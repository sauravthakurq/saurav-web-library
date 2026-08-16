import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Fragment } from "react";

import { LogoMark } from "@/components/Logo";

const NAV_LINKS = [
	{ label: "Home", href: "#home" },
	{ label: "How It Works", href: "#how-it-works" },
	{ label: "Philosophy", href: "#philosophy" },
	{ label: "Use Cases", href: "#use-cases" },
];

const SOCIALS = [
	{ label: "Instagram", href: "https://instagram.com", Icon: Instagram },
	{ label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
	{ label: "Twitter", href: "https://twitter.com", Icon: Twitter },
];

export function Navbar() {
	return (
		<motion.header
			initial={{ opacity: 0, y: -16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			className="fixed inset-x-0 top-0 z-50 px-8 py-4 md:px-28"
		>
			<nav className="flex items-center" aria-label="Primary">
				<a href="#home" className="flex items-center gap-2.5">
					<LogoMark />
					<span className="text-lg font-bold tracking-tight">Mindloop</span>
				</a>

				<div className="ml-12 hidden items-center gap-4 lg:flex">
					{NAV_LINKS.map(({ label, href }, i) => (
						<Fragment key={label}>
							{i > 0 && (
								<span
									aria-hidden
									className="text-[10px] text-muted-foreground/50"
								>
									•
								</span>
							)}
							<a
								href={href}
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								{label}
							</a>
						</Fragment>
					))}
				</div>

				<div className="ml-auto flex items-center gap-3">
					{SOCIALS.map(({ label, href, Icon }) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noreferrer"
							aria-label={label}
							className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground"
						>
							<Icon className="h-4 w-4" strokeWidth={1.75} />
						</a>
					))}
				</div>
			</nav>
		</motion.header>
	);
}
