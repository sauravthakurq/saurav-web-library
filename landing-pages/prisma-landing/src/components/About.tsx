import {
	type MotionValue,
	motion,
	useScroll,
	useTransform,
} from "framer-motion";
import { useRef } from "react";
import WordsPullUpMultiStyle from "./WordsPullUpMultiStyle";

const BODY_TEXT =
	"Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals.";

interface AnimatedLetterProps {
	char: string;
	index: number;
	totalChars: number;
	progress: MotionValue<number>;
}

function AnimatedLetter({
	char,
	index,
	totalChars,
	progress,
}: AnimatedLetterProps) {
	const charProgress = index / totalChars;
	const opacity = useTransform(
		progress,
		[charProgress - 0.1, charProgress + 0.05],
		[0.2, 1],
	);
	return <motion.span style={{ opacity }}>{char}</motion.span>;
}

function ScrollRevealParagraph({ className = "" }: { className?: string }) {
	const ref = useRef<HTMLParagraphElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start 0.8", "end 0.2"],
	});
	const totalChars = BODY_TEXT.length;
	const words = BODY_TEXT.split(" ");
	let charIndex = 0;

	return (
		<p ref={ref} className={className}>
			{words.map((word, wi) => {
				const wordStart = charIndex;
				charIndex += word.length + 1;
				return (
					<span key={`${word}-${wi}`} className="inline-block whitespace-pre">
						{word.split("").map((char, ci) => (
							<AnimatedLetter
								key={ci}
								char={char}
								index={wordStart + ci}
								totalChars={totalChars}
								progress={scrollYProgress}
							/>
						))}
						{wi < words.length - 1 ? " " : ""}
					</span>
				);
			})}
		</p>
	);
}

export default function About() {
	return (
		<section className="bg-black p-4 md:p-6">
			<div className="mx-auto max-w-6xl rounded-2xl bg-[#101010] px-6 py-16 text-center sm:px-10 sm:py-20 md:rounded-[2rem] md:py-28">
				<p className="text-[10px] text-primary sm:text-xs">Visual arts</p>
				<div className="mt-6 sm:mt-8">
					<WordsPullUpMultiStyle
						segments={[
							{ text: "I am Marcus Chen,", className: "font-normal" },
							{
								text: "a self-taught director.",
								className: "font-serif italic",
							},
							{
								text: "I have skills in color grading, visual effects, and narrative design.",
								className: "font-normal",
							},
						]}
						className="mx-auto max-w-3xl text-3xl leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
						style={{ color: "#E1E0CC" }}
					/>
				</div>
				<div className="mx-auto mt-10 max-w-2xl sm:mt-14">
					<ScrollRevealParagraph className="text-xs text-[#DEDBC8] sm:text-sm md:text-base" />
				</div>
			</div>
		</section>
	);
}
