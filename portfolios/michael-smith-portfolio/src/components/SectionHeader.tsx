import { motion } from "framer-motion";
import type { ReactNode } from "react";
import GradientRingButton from "./GradientRingButton";

interface SectionHeaderProps {
	eyebrow: string;
	heading: ReactNode;
	subtext: string;
	cta?: { label: string; href: string };
}

/** Shared section intro: eyebrow rule, serif-accented heading, subtext, optional CTA. */
const SectionHeader = ({
	eyebrow,
	heading,
	subtext,
	cta,
}: SectionHeaderProps) => (
	<motion.div
		initial={{ opacity: 0, y: 30 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true, margin: "-100px" }}
		transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
		className="mb-12 flex items-end justify-between gap-8 md:mb-16"
	>
		<div>
			<div className="mb-5 flex items-center gap-4">
				<span aria-hidden className="h-px w-8 bg-stroke" />
				<span className="text-xs uppercase tracking-[0.3em] text-muted">
					{eyebrow}
				</span>
			</div>
			<h2 className="mb-4 text-4xl tracking-tight text-text-primary md:text-5xl">
				{heading}
			</h2>
			<p className="max-w-md text-sm text-muted md:text-base">{subtext}</p>
		</div>
		{cta && (
			<GradientRingButton
				variant="pill"
				href={cta.href}
				className="hidden shrink-0 md:inline-flex"
			>
				{cta.label}
				<span
					aria-hidden
					className="transition-transform duration-300 group-hover:translate-x-0.5"
				>
					→
				</span>
			</GradientRingButton>
		)}
	</motion.div>
);

export default SectionHeader;
