import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";

interface Project {
	title: string;
	category: string;
	image: string;
	span: string;
	aspect: string;
}

const PROJECTS: Project[] = [
	{
		title: "Automotive Motion",
		category: "Art Direction",
		image: "/assets/unsplash-photo-1503376780353-7e6692767b70.jpg",
		span: "md:col-span-7",
		aspect: "aspect-[4/3] md:aspect-[7/5]",
	},
	{
		title: "Urban Architecture",
		category: "Photography",
		image: "/assets/unsplash-photo-1487958449943-2429e8be8625.jpg",
		span: "md:col-span-5",
		aspect: "aspect-[4/3] md:aspect-square",
	},
	{
		title: "Human Perspective",
		category: "Editorial",
		image: "/assets/unsplash-photo-1500648767791-00dcc994a43e.jpg",
		span: "md:col-span-5",
		aspect: "aspect-[4/3] md:aspect-square",
	},
	{
		title: "Brand Identity",
		category: "Identity",
		image: "/assets/unsplash-photo-1561070791-2526d30994b5.jpg",
		span: "md:col-span-7",
		aspect: "aspect-[4/3] md:aspect-[7/5]",
	},
];

const HALFTONE_STYLE = {
	backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
	backgroundSize: "4px 4px",
} as const;

const SelectedWorks = () => (
	<section id="work" className="bg-bg py-12 md:py-16">
		<div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
			<SectionHeader
				eyebrow="Selected Work"
				heading={
					<>
						Featured <span className="font-display italic">projects</span>
					</>
				}
				subtext="A selection of projects I've worked on, from concept to launch."
				cta={{ label: "View all work", href: "#work" }}
			/>

			<div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
				{PROJECTS.map((project, i) => (
					<motion.div
						key={project.title}
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{
							duration: 0.9,
							delay: (i % 2) * 0.12,
							ease: [0.25, 0.1, 0.25, 1],
						}}
						className={project.span}
					>
						<article
							className={`group relative overflow-hidden rounded-3xl border border-stroke bg-surface ${project.aspect}`}
						>
							<img
								src={project.image}
								alt={project.title}
								loading="lazy"
								className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							/>
							{/* Halftone texture */}
							<div
								aria-hidden
								className="absolute inset-0 opacity-20 mix-blend-multiply"
								style={HALFTONE_STYLE}
							/>
							{/* Hover veil + label */}
							<div className="absolute inset-0 flex items-center justify-center bg-bg/70 opacity-0 backdrop-blur-lg transition-opacity duration-500 group-hover:opacity-100">
								<span className="relative inline-flex">
									<span
										aria-hidden
										className="accent-gradient-animated absolute -inset-[2px] rounded-full"
									/>
									<span className="relative inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3 text-sm text-neutral-900">
										View —{" "}
										<span className="font-display italic">{project.title}</span>
									</span>
								</span>
							</div>
						</article>
						{/* Mobile caption (hover labels need a pointer) */}
						<div className="mt-3 flex items-baseline justify-between px-1 md:hidden">
							<h3 className="font-display text-lg italic text-text-primary">
								{project.title}
							</h3>
							<span className="text-xs uppercase tracking-[0.2em] text-muted">
								{project.category}
							</span>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	</section>
);

export default SelectedWorks;
