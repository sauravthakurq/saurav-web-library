import { useInViewAnimation } from "../hooks/useInViewAnimation";
import Button from "./Button";

const BOOK_URL = "https://halaskastudio.com/./book";

export default function PricingSection() {
	const { ref, animationClass } = useInViewAnimation<HTMLElement>();

	return (
		<section id="services" ref={ref} className="w-full px-6 py-12">
			<div className="md:flex md:justify-end">
				<div className="grid grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2">
					{/* Dark card — Monthly Partnership */}
					<article
						className={`rounded-[40px] bg-[#051A24] pb-10 pl-10 pr-10 pt-3 shadow-[inset_0_2px_16px_0_rgba(246,252,255,0.12)] md:pr-24 ${animationClass}`}
						style={{ animationDelay: "0.1s" }}
					>
						<h3 className="mt-7 text-[22px] font-medium text-[#F6FCFF]">
							Monthly Partnership
						</h3>
						<p className="mt-3 text-sm leading-relaxed text-[#E0EBF0]">
							A dedicated creative design team.
							<br />
							You work directly with Viktor.
						</p>
						<p className="mt-8 text-2xl text-[#F6FCFF]">$5,000</p>
						<p className="mt-1 text-sm text-[#E0EBF0]">Monthly</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button variant="primary" href={BOOK_URL}>
								Start a chat
							</Button>
							<Button variant="secondary" href={BOOK_URL}>
								How it works
							</Button>
						</div>
					</article>

					{/* Light card — Custom Project */}
					<article
						className={`rounded-[40px] bg-white pb-10 pl-10 pr-10 pt-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:pr-24 ${animationClass}`}
						style={{ animationDelay: "0.2s" }}
					>
						<h3 className="mt-7 text-[22px] font-medium text-[#0D212C]">
							Custom Project
						</h3>
						<p className="mt-3 text-sm leading-relaxed text-[#273C46]">
							Fixed scope, fixed timeline.
							<br />
							Same team, same standards.
						</p>
						<p className="mt-8 text-2xl text-[#0D212C]">$5,000</p>
						<p className="mt-1 text-sm text-[#273C46]">Minimum</p>
						<div className="mt-8 flex">
							<Button variant="tertiary" href={BOOK_URL}>
								Start a chat
							</Button>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}
