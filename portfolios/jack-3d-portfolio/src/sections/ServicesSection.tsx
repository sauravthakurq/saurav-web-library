import FadeIn from "../components/FadeIn";

const SERVICES = [
	{
		number: "01",
		name: "3D Modeling",
		description:
			"Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.",
	},
	{
		number: "02",
		name: "Rendering",
		description:
			"High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.",
	},
	{
		number: "03",
		name: "Motion Design",
		description:
			"Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.",
	},
	{
		number: "04",
		name: "Branding",
		description:
			"Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.",
	},
	{
		number: "05",
		name: "Web Design",
		description:
			"Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.",
	},
];

export default function ServicesSection() {
	return (
		<section
			id="price"
			className="relative rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
		>
			<FadeIn delay={0} y={40}>
				<h2
					className="mb-16 text-center font-black uppercase leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
					style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
				>
					Services
				</h2>
			</FadeIn>

			<div className="mx-auto max-w-5xl">
				{SERVICES.map((service, i) => (
					<FadeIn
						key={service.number}
						delay={i * 0.1}
						className={
							i < SERVICES.length - 1
								? "border-b border-[rgba(12,12,12,0.15)]"
								: undefined
						}
					>
						<div className="flex items-start gap-6 py-8 sm:gap-10 sm:py-10 md:gap-14 md:py-12">
							<span
								className="font-black leading-none text-[#0C0C0C]"
								style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}
							>
								{service.number}
							</span>
							<div className="flex flex-col gap-2 pt-1 sm:gap-3 sm:pt-2">
								<h3
									className="font-medium uppercase text-[#0C0C0C]"
									style={{ fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}
								>
									{service.name}
								</h3>
								<p
									className="max-w-2xl font-light leading-relaxed text-[#0C0C0C]"
									style={{
										fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)",
										opacity: 0.6,
									}}
								>
									{service.description}
								</p>
							</div>
						</div>
					</FadeIn>
				))}
			</div>
		</section>
	);
}
