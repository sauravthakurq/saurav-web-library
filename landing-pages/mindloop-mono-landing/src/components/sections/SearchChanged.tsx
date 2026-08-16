import { motion } from "framer-motion";

import iconChatgpt from "@/assets/icon-chatgpt.png";
import iconGoogle from "@/assets/icon-google.png";
import iconPerplexity from "@/assets/icon-perplexity.png";
import { fadeUp } from "@/lib/motion";

const PLATFORMS = [
	{
		name: "ChatGPT",
		icon: iconChatgpt,
		description:
			"Hundreds of millions of people now ask ChatGPT first. If your ideas aren't part of the answer, they're invisible.",
	},
	{
		name: "Perplexity",
		icon: iconPerplexity,
		description:
			"Answer engines cite sources in real time. Depth and authority decide who gets referenced — and who gets skipped.",
	},
	{
		name: "Google AI",
		icon: iconGoogle,
		description:
			"AI Overviews answer before anyone clicks. The open web rewards creators whose writing is worth surfacing.",
	},
];

export function SearchChanged() {
	return (
		<section id="how-it-works" className="px-6 pb-6 pt-52 md:pb-9 md:pt-64">
			<div className="mx-auto max-w-6xl text-center">
				<motion.h2
					{...fadeUp(0)}
					className="text-5xl font-medium tracking-[-2px] md:text-7xl lg:text-8xl"
				>
					Search has <em className="font-serif font-normal italic">changed.</em>
					<br />
					Have you?
				</motion.h2>

				<motion.p
					{...fadeUp(0.1)}
					className="mx-auto mb-24 mt-6 max-w-2xl text-lg text-muted-foreground"
				>
					People no longer browse — they ask. Your audience is getting its
					answers from AI, and the voices those answers draw on are being chosen
					right now.
				</motion.p>

				<div className="mb-20 grid gap-12 md:grid-cols-3 md:gap-8">
					{PLATFORMS.map(({ name, icon, description }, i) => (
						<motion.article
							key={name}
							{...fadeUp(0.15 + i * 0.1)}
							className="flex flex-col items-center"
						>
							<img
								src={icon}
								alt={`${name} icon`}
								width={200}
								height={200}
								className="mb-8 h-[200px] w-[200px]"
							/>
							<h3 className="text-base font-semibold">{name}</h3>
							<p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
								{description}
							</p>
						</motion.article>
					))}
				</div>

				<motion.p
					{...fadeUp(0.2)}
					className="text-center text-sm text-muted-foreground"
				>
					If you don't answer the questions, someone else will.
				</motion.p>
			</div>
		</section>
	);
}
