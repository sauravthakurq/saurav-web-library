import Marquee, { type MarqueeBrand } from "./Marquee";

const BACKERS: MarqueeBrand[] = [
	{
		name: "Fundamental Labs",
		style: {
			fontFamily: "'Times New Roman', serif",
			fontWeight: 400,
			letterSpacing: "0.02em",
			fontSize: "14px",
		},
	},
	{
		name: "KUCOIN",
		style: {
			fontFamily: "'Arial Black', Arial, sans-serif",
			fontWeight: 900,
			letterSpacing: "0.08em",
			fontSize: "16px",
		},
	},
	{
		name: "NGC",
		style: {
			fontFamily: "Impact, sans-serif",
			fontWeight: 700,
			letterSpacing: "0.05em",
			fontSize: "18px",
		},
	},
	{
		name: "NxGen",
		style: {
			fontFamily: "Georgia, serif",
			fontWeight: 600,
			letterSpacing: "-0.02em",
			fontSize: "17px",
		},
	},
	{
		name: "Matter Labs",
		style: {
			fontFamily: "Helvetica, Arial, sans-serif",
			fontWeight: 700,
			letterSpacing: "-0.01em",
			fontSize: "15px",
		},
	},
	{
		name: "DEXTools",
		style: {
			fontFamily: "Verdana, sans-serif",
			fontWeight: 700,
			letterSpacing: "0.06em",
			fontSize: "14px",
			textTransform: "uppercase",
		},
	},
	{
		name: "NGRAVE",
		style: {
			fontFamily: "'Courier New', monospace",
			fontWeight: 700,
			letterSpacing: "0.18em",
			fontSize: "14px",
		},
	},
	{
		name: "Polychain",
		style: {
			fontFamily: "Palatino, 'Book Antiqua', serif",
			fontWeight: 500,
			letterSpacing: "0.03em",
			fontSize: "15px",
		},
	},
];

export default function BackedBySection() {
	return (
		<section className="bg-[#F5F5F5] px-6">
			<div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
				<p className="text-black/70 text-base leading-relaxed">
					Funded by premier partners
					<br />
					and forward-thinking leaders.
				</p>

				<div className="md:col-span-3 overflow-hidden">
					<Marquee
						brands={BACKERS}
						trackClass="backers-track"
						keyframesName="backers-marquee"
						durationSeconds={30}
						itemClass="mx-10 shrink-0 text-black/50 whitespace-nowrap"
					/>
				</div>
			</div>
		</section>
	);
}
