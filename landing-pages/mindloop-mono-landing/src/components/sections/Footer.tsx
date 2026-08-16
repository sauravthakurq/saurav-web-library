const FOOTER_LINKS = [
	{ label: "Privacy", href: "#privacy" },
	{ label: "Terms", href: "#terms" },
	{ label: "Contact", href: "#contact" },
];

export function Footer() {
	return (
		<footer className="px-8 py-12 md:px-28">
			<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<p className="text-sm text-muted-foreground">
					© 2026 Mindloop. All rights reserved.
				</p>
				<nav className="flex items-center gap-6" aria-label="Footer">
					{FOOTER_LINKS.map(({ label, href }) => (
						<a
							key={label}
							href={href}
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							{label}
						</a>
					))}
				</nav>
			</div>
		</footer>
	);
}
