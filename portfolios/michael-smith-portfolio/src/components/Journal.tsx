import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";

interface Entry {
	title: string;
	readTime: string;
	date: string;
	image: string;
}

const ENTRIES: Entry[] = [
	{
		title: "Designing with intent: systems over screens",
		readTime: "6 min read",
		date: "May 28, 2026",
		image: "/assets/unsplash-photo-1558655146-d09347e92766.jpg",
	},
	{
		title: "The quiet power of micro-interactions",
		readTime: "4 min read",
		date: "Apr 14, 2026",
		image: "/assets/unsplash-photo-1545235617-9465d2a55698.jpg",
	},
	{
		title: "From Figma to production without losing the soul",
		readTime: "8 min read",
		date: "Mar 02, 2026",
		image: "/assets/unsplash-photo-1498050108023-c5249f4df085.jpg",
	},
	{
		title: "Notes on building in public",
		readTime: "5 min read",
		date: "Jan 19, 2026",
		image: "/assets/unsplash-photo-1499951360447-b19be8fe80f5.jpg",
	},
];

const Journal = () => (
	<section id="journal" className="bg-bg py-16 md:py-24">
		<div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
			<SectionHeader
				eyebrow="Journal"
				heading={
					<>
						Recent <span className="font-display italic">thoughts</span>
					</>
				}
				subtext="Field notes on design, engineering, and everything in between."
				cta={{ label: "View all", href: "#journal" }}
			/>

			<div className="flex flex-col gap-4">
				{ENTRIES.map((entry, i) => (
					<motion.article
						key={entry.title}
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{
							duration: 0.7,
							delay: i * 0.08,
							ease: [0.25, 0.1, 0.25, 1],
						}}
						className="group flex cursor-pointer items-center gap-4 rounded-[40px] border border-stroke bg-surface/30 p-4 transition-colors duration-300 hover:bg-surface sm:gap-6 sm:rounded-full"
					>
						<img
							src={entry.image}
							alt=""
							loading="lazy"
							className="h-16 w-16 shrink-0 rounded-[24px] object-cover sm:h-20 sm:w-20 sm:rounded-full"
						/>
						<div className="min-w-0 flex-1">
							<h3 className="mb-1 text-base text-text-primary sm:text-lg">
								{entry.title}
							</h3>
							<p className="text-xs text-muted sm:text-sm">{entry.readTime}</p>
						</div>
						<span className="hidden shrink-0 text-sm text-muted lg:block">
							{entry.date}
						</span>
						<span
							aria-hidden
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stroke text-muted transition-all duration-300 group-hover:rotate-45 group-hover:border-text-primary/30 group-hover:text-text-primary sm:mr-2"
						>
							↗
						</span>
					</motion.article>
				))}
			</div>
		</div>
	</section>
);

export default Journal;
