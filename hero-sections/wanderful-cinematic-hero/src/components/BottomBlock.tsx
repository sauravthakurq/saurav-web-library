import { Lock } from "lucide-react";

interface BottomBlockProps {
	mounted: boolean;
}

export default function BottomBlock({ mounted }: BottomBlockProps) {
	return (
		<div
			className={`fixed inset-x-0 bottom-14 z-20 flex flex-col items-center gap-6 px-6 transition-all delay-300 duration-1000 ${
				mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
			}`}
		>
			<p className="max-w-[620px] text-center text-[15px] leading-relaxed">
				<span className="text-white">
					Our smart itineraries shape around you &mdash; your rhythm, your vibe,
					your hunger for adventure.
				</span>
				<span className="text-white/55">
					{" "}
					Each getaway is tailored, seamless, and wholly yours.
				</span>
			</p>

			<button
				type="button"
				className="rounded-full bg-white px-8 py-3.5 text-[15px] font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_4px_rgba(255,255,255,0.2)] active:scale-[0.97]"
			>
				Plan my escape today
			</button>

			<div className="flex items-center gap-2 text-white/70">
				<Lock size={13} strokeWidth={1.5} />
				<span className="text-[11px] font-medium tracking-[0.14em]">
					SECURE BY DESIGN. ZERO DATA LEAKS.
				</span>
			</div>
		</div>
	);
}
