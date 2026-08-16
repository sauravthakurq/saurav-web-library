import {
	ChromaFlow,
	FilmGrain,
	FlutedGlass,
	Shader,
	Swirl,
} from "shaders/react";
import Navbar from "./Navbar";
import PartnerIcon from "./PartnerIcon";
import RollButton from "./RollButton";

export default function Hero() {
	return (
		<section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
			<Shader className="pointer-events-none absolute inset-0 z-10">
				<Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
				<ChromaFlow
					baseColor="#ffffff"
					downColor="#ff5f03"
					leftColor="#ff5f03"
					rightColor="#ff5f03"
					upColor="#ff5f03"
					momentum={13}
					radius={3.5}
				/>
				<FlutedGlass
					aberration={0.61}
					angle={31}
					frequency={8}
					highlight={0.12}
					highlightSoftness={0}
					lightAngle={-90}
					refraction={4}
					shape="rounded"
					softness={1}
					speed={0.15}
				/>
				<FilmGrain strength={0.05} />
			</Shader>

			<Navbar />

			<div className="flex-1" />

			<div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
				<p className="mb-5 text-[13px] tracking-wide text-gray-900 sm:mb-8 sm:text-[14px]">
					Axion Studio
				</p>
				<h1 className="text-[length:clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[length:clamp(2.5rem,5vw,4.2rem)]">
					We craft digital experiences
					<br className="hidden sm:block" />
					<span className="sm:hidden"> </span>
					for brands ready to dominate
					<br className="hidden sm:block" />
					<span className="sm:hidden"> </span>
					their category online.
				</h1>
				<div className="mt-8 flex flex-col items-start gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
					<RollButton
						label="Start a project"
						className="bg-[#F26522] py-2 pl-5 pr-2 text-[13px] text-white hover:bg-[#e05a1a] sm:pl-6 sm:text-[14px]"
						circleClassName="h-7 w-7 sm:h-8 sm:w-8"
						arrowClassName="text-[#F26522]"
					/>
					<a
						href="#"
						className="flex items-center gap-2 rounded-[4px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] sm:gap-2.5 sm:px-4 sm:py-2.5"
					>
						<PartnerIcon className="h-5 w-5 fill-current text-[#E8704E] sm:h-6 sm:w-6" />
						<span className="text-[13px] font-medium text-gray-900 sm:text-[14px]">
							Certified Partner
						</span>
						<span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white sm:px-2 sm:text-[11px]">
							Featured
						</span>
					</a>
				</div>
			</div>
		</section>
	);
}
