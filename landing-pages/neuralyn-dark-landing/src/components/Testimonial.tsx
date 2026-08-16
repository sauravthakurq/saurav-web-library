import {
	type MotionValue,
	motion,
	useScroll,
	useTransform,
} from "framer-motion";
import { useRef } from "react";
import quoteSymbol from "@/assets/quote-symbol.png";
import avatar from "@/assets/testimonial-avatar.png";

const QUOTE =
	"Neuralyn revolutionized how we handle financial insights using smart analytics. We are now driving better outcomes quicker than we ever imagined! Neuralyn revolutionized how we handle financial insights using smart analytics.";

function Word({
	children,
	progress,
	range,
}: {
	children: string;
	progress: MotionValue<number>;
	range: [number, number];
}) {
	const opacity = useTransform(progress, range, [0.2, 1]);
	const color = useTransform(progress, range, [
		"hsl(0 0% 35%)",
		"hsl(0 0% 100%)",
	]);

	return (
		<motion.span style={{ opacity, color }} className="mr-[0.3em]">
			{children}
		</motion.span>
	);
}

export default function Testimonial() {
	const containerRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end center"],
	});

	const words = QUOTE.split(" ");

	return (
		<section
			data-testid="testimonial"
			className="flex min-h-screen items-center justify-center px-8 py-24 md:px-28 md:py-32"
		>
			<div
				ref={containerRef}
				className="mx-auto flex w-full max-w-3xl flex-col items-start gap-10"
			>
				<img
					src={quoteSymbol}
					alt=""
					aria-hidden="true"
					className="h-10 w-14 object-contain"
				/>

				<p
					data-testid="testimonial-quote"
					className="flex flex-wrap text-4xl font-medium leading-[1.2] md:text-5xl"
				>
					{words.map((word, i) => (
						<Word
							key={`${word}-${i}`}
							progress={scrollYProgress}
							range={[i / words.length, (i + 1) / words.length]}
						>
							{word}
						</Word>
					))}
					<span className="ml-2 text-muted-foreground">&rdquo;</span>
				</p>

				<div className="flex items-center gap-4">
					<img
						src={avatar}
						alt="Brooklyn Simmons"
						className="h-14 w-14 rounded-full border-[3px] border-foreground object-cover"
					/>
					<div>
						<p className="text-base font-semibold leading-7 text-foreground">
							Brooklyn Simmons
						</p>
						<p className="text-sm font-normal leading-5 text-muted-foreground">
							Product Manager
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
