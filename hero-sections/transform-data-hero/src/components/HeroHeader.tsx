import { Icon } from "./icons";

function Badge() {
	return (
		<div className="rise-in flex items-center gap-2.5 rounded-full bg-white/90 py-1.5 pl-1.5 pr-4 font-inter text-sm font-normal text-ink shadow-[0_2px_14px_rgba(0,0,0,0.10)]">
			<span className="flex items-center gap-1 rounded-full bg-badge-dark px-2.5 py-1 text-white">
				<Icon name="star" size={12} />
				New
			</span>
			Discover what&rsquo;s possible
		</div>
	);
}

/** Badge + headline + subtitle, with 34px gaps between each element. */
export default function HeroHeader() {
	return (
		<header className="flex flex-col items-center gap-[34px]">
			<Badge />
			<h1
				className="rise-in text-center font-fustat text-[clamp(44px,9vw,80px)] font-bold leading-none tracking-[-0.06em] text-ink lg:text-[80px] lg:tracking-[-4.8px]"
				style={{ animationDelay: "90ms" }}
			>
				Transform Data Quickly
			</h1>
			<p
				className="rise-in w-full max-w-[736px] text-center font-fustat text-xl font-medium tracking-[-0.4px] text-gray-mid sm:w-[542px]"
				style={{ animationDelay: "180ms" }}
			>
				Upload your information and get powerful insights right away. Work
				smarter and achieve goals effortlessly.
			</p>
		</header>
	);
}
