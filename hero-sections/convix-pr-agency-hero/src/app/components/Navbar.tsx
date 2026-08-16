import { ChevronDown, ChevronRight, Menu, ShoppingCart } from "lucide-react";
import { useState } from "react";

const ORANGE = "#ef4d23";
const NAV_LINKS = ["Home", "Features", "About", "Pages"] as const;

type NavLink = (typeof NAV_LINKS)[number];

/** 8-petal flower: 8 circles at radius 10 around (16,16) plus a center circle, all r=3.5. */
function FlowerLogo({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 32 32"
			className={className}
			role="img"
			aria-label="Convix Software logo"
		>
			{Array.from({ length: 8 }, (_, i) => {
				const angle = (i * Math.PI) / 4;
				return (
					<circle
						key={i}
						cx={16 + 10 * Math.cos(angle)}
						cy={16 + 10 * Math.sin(angle)}
						r={3.5}
						fill={ORANGE}
					/>
				);
			})}
			<circle cx={16} cy={16} r={3.5} fill={ORANGE} />
		</svg>
	);
}

function NavLabel({ link }: { link: NavLink }) {
	if (link === "Home") {
		return (
			<>
				<span
					className="h-1.5 w-1.5 rounded-full bg-black"
					aria-hidden="true"
				/>
				Home
			</>
		);
	}
	if (link === "Pages") {
		return (
			<>
				Pages
				<ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
			</>
		);
	}
	return <>{link}</>;
}

export default function Navbar() {
	const [open, setOpen] = useState(false);

	return (
		<header className="flex justify-center px-3 pt-4 sm:px-4 sm:pt-6">
			<nav className="relative flex w-full max-w-[760px] items-center rounded-full border border-neutral-200 bg-white py-2 pl-2 pr-2 shadow-sm">
				<a
					href="#"
					className="shrink-0 pl-1.5"
					aria-label="Convix Software home"
				>
					<FlowerLogo className="h-7 w-7 sm:h-8 sm:w-8" />
				</a>

				<div className="hidden items-center gap-6 pl-5 text-[14px] md:flex">
					{NAV_LINKS.map((link) => (
						<a
							key={link}
							href="#"
							className="inline-flex items-center gap-1.5 font-medium text-neutral-900 transition-colors hover:text-neutral-500"
							style={link === "Pages" ? { color: ORANGE } : undefined}
						>
							<NavLabel link={link} />
						</a>
					))}
				</div>

				<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
					<button
						type="button"
						className="hidden p-2 text-neutral-700 transition-colors hover:text-neutral-900 md:inline-flex"
						aria-label="Cart"
					>
						<ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
					</button>
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-full bg-[#ef4d23] py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 sm:text-[14px]"
					>
						<span className="hidden sm:inline">Get early access</span>
						<span className="sm:hidden">Early access</span>
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
							<ChevronRight className="h-4 w-4" strokeWidth={2} />
						</span>
					</button>
					<button
						type="button"
						className="inline-flex p-2 text-neutral-800 md:hidden"
						aria-label="Toggle menu"
						aria-expanded={open}
						onClick={() => setOpen((value) => !value)}
					>
						<Menu className="h-5 w-5" strokeWidth={2} />
					</button>
				</div>

				{open && (
					<div className="absolute left-2 right-2 top-full z-20 mt-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:hidden">
						{NAV_LINKS.map((link) => (
							<a
								key={link}
								href="#"
								className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-neutral-900 hover:bg-neutral-50"
								style={link === "Pages" ? { color: ORANGE } : undefined}
								onClick={() => setOpen(false)}
							>
								<NavLabel link={link} />
							</a>
						))}
					</div>
				)}
			</nav>
		</header>
	);
}
