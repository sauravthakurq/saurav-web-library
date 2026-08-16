import { ArrowUpRight } from "lucide-react";
import { useInViewAnimation } from "../hooks/useInViewAnimation";
import Button from "./Button";

const ANCHOR_LINKS = [
	{ label: "Services", href: "#services" },
	{ label: "Work", href: "#work" },
	{ label: "About", href: "#about" },
];

const EXTERNAL_LINKS = [
	{ label: "x.com", href: "https://x.com" },
	{ label: "LinkedIn", href: "https://www.linkedin.com" },
];

export default function Footer() {
	const { ref, animationClass } = useInViewAnimation<HTMLElement>();

	return (
		<footer
			ref={ref}
			className={`mx-auto w-full max-w-[1200px] px-6 py-12 ${animationClass}`}
			style={{ animationDelay: "0.1s" }}
		>
			<div className="flex flex-col justify-between gap-12 md:flex-row">
				<div>
					<Button variant="primary" href="https://halaskastudio.com/./book">
						Start a chat
					</Button>
				</div>
				<div className="flex items-start gap-8">
					<ArrowUpRight
						className="mt-1 h-5 w-5 text-[#051A24]"
						aria-hidden="true"
					/>
					<nav className="flex flex-col gap-3" aria-label="Site">
						{ANCHOR_LINKS.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="text-base text-[#051A24] transition-opacity hover:opacity-70"
							>
								{link.label}
							</a>
						))}
					</nav>
					<nav className="flex flex-col gap-3" aria-label="Social">
						{EXTERNAL_LINKS.map((link) => (
							<a
								key={link.label}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-base text-[#051A24] transition-opacity hover:opacity-70"
							>
								{link.label}
							</a>
						))}
					</nav>
				</div>
			</div>
		</footer>
	);
}
