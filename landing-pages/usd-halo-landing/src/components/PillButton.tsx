import { ArrowRight } from "lucide-react";

interface PillButtonProps {
	label: string;
	/** Bumps the label to text-lg on md+ screens (used by the hero "Join us"). */
	large?: boolean;
}

/** Black pill button with a trailing white arrow circle. */
export default function PillButton({ label, large = false }: PillButtonProps) {
	return (
		<button
			type="button"
			className={`inline-flex items-center gap-3 bg-black text-white ${
				large ? "text-base md:text-lg" : "text-base"
			} font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200`}
		>
			<span>{label}</span>
			<span className="bg-white rounded-full p-2">
				<ArrowRight className="w-5 h-5 text-black" />
			</span>
		</button>
	);
}
