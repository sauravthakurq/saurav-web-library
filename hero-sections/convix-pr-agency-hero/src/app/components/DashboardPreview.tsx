import { ChevronDown, TrendingDown, TrendingUp, X } from "lucide-react";
import { useId } from "react";
import Gauge from "./Gauge";

const ORANGE = "#ef4d23";

function CardHeader({ title, period }: { title: string; period: string }) {
	return (
		<div className="flex items-center justify-between text-[13px]">
			<span className="font-medium text-[#ef4d23]">{title}</span>
			<span className="text-neutral-500">{period}</span>
		</div>
	);
}

function TogglePill({
	active,
	inactive,
}: {
	active: string;
	inactive: string;
}) {
	return (
		<div className="flex rounded-full bg-neutral-100 p-1 text-[12px] font-medium">
			<button
				type="button"
				className="flex-1 rounded-full bg-white px-3 py-1.5 text-neutral-900 shadow"
			>
				{active}
			</button>
			<button
				type="button"
				className="flex-1 rounded-full px-3 py-1.5 text-neutral-500"
			>
				{inactive}
			</button>
		</div>
	);
}

function Dropdown({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<span className="mb-1 block text-[12px] text-neutral-700">{label}</span>
			<button
				type="button"
				className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-[13px] text-neutral-900"
			>
				{value}
				<ChevronDown className="h-4 w-4 text-neutral-500" strokeWidth={2} />
			</button>
		</div>
	);
}

function TargetInput({
	label,
	defaultValue,
}: {
	label: string;
	defaultValue: string;
}) {
	const id = useId();
	return (
		<div>
			<label htmlFor={id} className="mb-1 block text-[12px] text-neutral-700">
				{label}
			</label>
			<div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 focus-within:border-neutral-400">
				<span className="text-[13px] text-neutral-400">#</span>
				<input
					id={id}
					type="text"
					inputMode="numeric"
					defaultValue={defaultValue}
					className="w-full bg-transparent text-[13px] text-neutral-900 outline-none"
				/>
			</div>
		</div>
	);
}

function ClicksCard() {
	return (
		<div className="flex flex-col rounded-2xl bg-white p-5">
			<CardHeader title="Clicks" period="This Month" />
			<div className="mt-3 flex items-center gap-2">
				<span className="text-[28px] font-semibold leading-none">6,896</span>
				<span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
					<TrendingDown className="h-3 w-3" strokeWidth={2} />
					-3,382 (33%)
				</span>
			</div>
			<p className="mt-1 text-[11px] text-neutral-500">Compared to yesterday</p>
			<p className="mt-4 text-center text-[12px] text-neutral-600">
				Month Target achieved
			</p>
			<div className="mt-1">
				<Gauge value={92} color={ORANGE} showLabels min="389K" max="425K" />
			</div>
			<div className="mt-auto pt-4">
				<TogglePill active="Impressions" inactive="Clicks" />
			</div>
		</div>
	);
}

function TargetsFormCard() {
	return (
		<div className="flex flex-col gap-3 rounded-2xl bg-white p-5">
			<Dropdown label="Show figures for" value="This month" />
			<Dropdown label="Compare period by" value="Month-to-date (MTD)" />
			<TargetInput label="Ste targets (This month)" defaultValue="10" />
			<TargetInput label="Ste targets (This year)" defaultValue="100" />
			<div className="mt-auto flex items-center gap-4 pt-1">
				<button
					type="button"
					className="rounded-lg bg-[#ef4d23] px-5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
				>
					Save
				</button>
				<button
					type="button"
					className="text-[13px] text-neutral-700 underline underline-offset-2"
				>
					Cancel
				</button>
				<button
					type="button"
					className="ml-auto p-1 text-neutral-500 hover:text-neutral-800"
					aria-label="Close"
				>
					<X className="h-4 w-4" strokeWidth={2} />
				</button>
			</div>
		</div>
	);
}

function VideoStartsCard() {
	return (
		<div className="flex flex-col rounded-2xl bg-white p-5">
			<CardHeader title="Video Starts" period="today" />
			<div className="mt-3 flex items-center gap-2">
				<span className="text-[28px] font-semibold leading-none">0</span>
				<span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
					<TrendingUp className="h-3 w-3" strokeWidth={2} />0
				</span>
			</div>
			<p className="mt-1 text-[11px] text-neutral-500">Compared to yesterday</p>
			<div className="mt-5">
				<Gauge value={68} color="#9ca3af" />
			</div>
			<div className="mt-auto pt-4">
				<TogglePill active="Video Clicks" inactive="Video Starts" />
			</div>
		</div>
	);
}

export default function DashboardPreview() {
	return (
		<div className="px-3 sm:px-4">
			<div className="mx-auto w-full max-w-[880px] rounded-3xl bg-[#f5f2ee] p-4 sm:p-6">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
					<ClicksCard />
					<TargetsFormCard />
					<VideoStartsCard />
				</div>
			</div>
		</div>
	);
}
