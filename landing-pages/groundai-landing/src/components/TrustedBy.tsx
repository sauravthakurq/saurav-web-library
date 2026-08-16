import { A } from "../lib/assets";

const FONT_HEADING = "'Inter Tight', sans-serif";
const FONT_ACCENT = "'Playfair Display', serif";
const FONT_BRAND = "'Satoshi', system-ui, sans-serif";

type Brand = { name: string; icon: string | null };

const BRANDS: Brand[] = [
	{ name: "Nueral", icon: A.Nueral },
	{ name: "GroundAI", icon: null },
	{ name: "Wids", icon: A.Wids },
	{ name: "Orinya", icon: A.Orinya },
	{ name: "Xyreion", icon: A.Xyreion },
	{ name: "Skodia", icon: A.Skodia },
	{ name: "GreenFlag", icon: A.GreenFlag },
];

export function TrustedBy() {
	const items = [...BRANDS, ...BRANDS];

	return (
		<section className="bg-white pt-16 pb-14 px-[40px]">
			<h2
				className="text-center text-3xl md:text-4xl font-medium text-neutral-900 mb-12"
				style={{ fontFamily: FONT_HEADING }}
			>
				Trusted by the{" "}
				<span style={{ fontFamily: FONT_ACCENT, fontStyle: "italic" }}>
					leading brands
				</span>
			</h2>

			<div className="relative overflow-hidden">
				<div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
				<div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />

				<div className="flex w-max animate-marquee gap-16">
					{items.map((brand, i) => (
						<div
							// eslint-disable-next-line react/no-array-index-key
							key={`${brand.name}-${i}`}
							className="flex items-center gap-3 shrink-0 opacity-40"
						>
							{brand.icon ? (
								<img src={brand.icon} alt="" className="h-8 w-auto" />
							) : null}
							<span
								className="text-3xl font-bold text-black whitespace-nowrap"
								style={{ fontFamily: FONT_BRAND }}
							>
								{brand.name}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
