import type { FormEvent } from "react";
import { useState } from "react";
import type { IconName } from "./icons";
import { Icon } from "./icons";

const MAX_CHARS = 3000;

const ACTION_BUTTONS: ReadonlyArray<{ label: string; icon: IconName }> = [
	{ label: "Attach", icon: "paperclip" },
	{ label: "Voice", icon: "microphone" },
	{ label: "Prompts", icon: "search" },
];

export default function SearchBox() {
	const [question, setQuestion] = useState("");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setQuestion("");
	};

	return (
		<section
			className="rise-in mt-[44px] flex h-[200px] w-full max-w-[728px] flex-col gap-2.5 rounded-[18px] bg-[rgba(0,0,0,0.24)] p-2.5 backdrop-blur-md"
			style={{ animationDelay: "270ms" }}
		>
			{/* Top row — credits + model attribution */}
			<div className="flex items-center justify-between px-1.5 pt-0.5 font-schibsted text-xs font-medium text-white">
				<div className="flex items-center gap-2.5">
					<span>60/450 credits</span>
					<button
						type="button"
						className="rounded-md bg-[rgba(90,225,76,0.89)] px-2.5 py-1 font-schibsted text-xs font-semibold text-ink transition-transform duration-150 hover:scale-105 active:scale-95"
					>
						Upgrade
					</button>
				</div>
				<div className="flex items-center gap-1.5">
					<Icon name="aiSparkle" size={14} />
					<span>Powered by GPT-4o</span>
				</div>
			</div>

			{/* Main input area */}
			<div className="flex flex-1 flex-col rounded-[12px] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
				<form onSubmit={handleSubmit} className="flex items-center gap-3">
					<input
						type="text"
						value={question}
						onChange={(event) =>
							setQuestion(event.target.value.slice(0, MAX_CHARS))
						}
						maxLength={MAX_CHARS}
						placeholder="Type question..."
						aria-label="Ask a question about your data"
						className="h-9 flex-1 bg-transparent font-inter text-base text-ink outline-none placeholder:text-[rgba(0,0,0,0.6)]"
					/>
					<button
						type="submit"
						aria-label="Submit question"
						className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-150 hover:scale-105 active:scale-95"
					>
						<Icon
							name="upArrow"
							size={16}
							className="transition-transform duration-150 group-hover:-translate-y-0.5"
						/>
					</button>
				</form>

				{/* Bottom row — quick actions + character counter */}
				<div className="mt-auto flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						{ACTION_BUTTONS.map(({ label, icon }) => (
							<button
								key={label}
								type="button"
								className="flex items-center gap-1.5 rounded-[6px] bg-gray-soft px-3 py-1.5 font-schibsted text-[13px] font-medium text-gray-mid transition-colors duration-150 hover:bg-[#ededed] hover:text-ink"
							>
								<Icon name={icon} size={14} />
								{label}
							</button>
						))}
					</div>
					<span
						data-testid="char-counter"
						className="font-schibsted text-xs font-medium text-gray-mid"
					>
						{question.length.toLocaleString("en-US")}/
						{MAX_CHARS.toLocaleString("en-US")}
					</span>
				</div>
			</div>
		</section>
	);
}
