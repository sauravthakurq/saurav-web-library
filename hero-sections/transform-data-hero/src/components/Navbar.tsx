import { Icon } from "./icons";

const MENU_ITEMS = ["Platform", "Features", "Projects", "Community", "Contact"];

export default function Navbar() {
	return (
		<nav className="flex items-center justify-between px-6 py-4 md:px-12 xl:px-[120px]">
			<a
				href="#"
				className="font-schibsted text-2xl font-semibold tracking-[-1.44px] text-ink"
			>
				Logoipsum
			</a>

			<ul className="hidden items-center gap-8 lg:flex">
				{MENU_ITEMS.map((item) => (
					<li key={item}>
						<a
							href="#"
							className="group flex items-center gap-1 font-schibsted text-base font-medium tracking-[-0.2px] text-ink transition-opacity duration-150 hover:opacity-60"
						>
							{item}
							{item === "Features" && (
								<Icon
									name="chevronDown"
									size={14}
									className="transition-transform duration-150 group-hover:translate-y-0.5"
								/>
							)}
						</a>
					</li>
				))}
			</ul>

			<div className="flex items-center gap-2">
				<button
					type="button"
					className="h-10 w-[82px] rounded-lg bg-transparent font-schibsted text-base font-medium tracking-[-0.2px] text-ink transition-opacity duration-150 hover:opacity-60"
				>
					Sign Up
				</button>
				<button
					type="button"
					className="h-10 w-[101px] rounded-lg bg-ink font-schibsted text-base font-medium tracking-[-0.2px] text-white transition-transform duration-150 hover:scale-[1.03] active:scale-95"
				>
					Log In
				</button>
			</div>
		</nav>
	);
}
