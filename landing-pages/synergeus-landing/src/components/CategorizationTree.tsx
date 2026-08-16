import { motion } from "framer-motion";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";

type NodeId =
	| "root"
	| "transport"
	| "entertainment"
	| "transportDetail"
	| "entertainmentDetail"
	| "bills"
	| "billsDetail";

interface Point {
	topX: number;
	topY: number;
	botX: number;
	botY: number;
}

// ----- Glass italic pill (NodeA) -----
interface NodeAProps {
	children: React.ReactNode;
	isInView: boolean;
	delay: number;
}

const NodeA = forwardRef<HTMLDivElement, NodeAProps>(
	({ children, isInView, delay }, ref) => (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, scale: 0.85 }}
			animate={isInView ? { opacity: 1, scale: 1 } : undefined}
			transition={{ duration: 0.45, ease: "easeOut", delay }}
			style={{
				borderRadius: 9999,
				border: "1px solid rgba(255,255,255,0.25)",
				background: "rgba(255,255,255,0.10)",
				backdropFilter: "blur(20px)",
				WebkitBackdropFilter: "blur(20px)",
				padding: "10px 20px",
				fontFamily: '"Instrument Serif", serif',
				fontStyle: "italic",
				fontSize: 16,
				color: "#fff",
				display: "inline-block",
				whiteSpace: "nowrap",
			}}
		>
			{children}
		</motion.div>
	),
);
NodeA.displayName = "NodeA";

// ----- White detail card (NodeB) -----
interface NodeBProps {
	children: React.ReactNode;
	isInView: boolean;
	delay: number;
}

const NodeB = forwardRef<HTMLDivElement, NodeBProps>(
	({ children, isInView, delay }, ref) => (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, scale: 0.85 }}
			animate={isInView ? { opacity: 1, scale: 1 } : undefined}
			transition={{ duration: 0.45, ease: "easeOut", delay }}
			style={{
				borderRadius: 12,
				background: "rgba(255,255,255,0.92)",
				padding: "10px 16px",
				fontFamily: '"Inter Tight", sans-serif',
				fontSize: 12,
				fontWeight: 400,
				color: "rgba(0,0,0,0.75)",
				lineHeight: 1.5,
				display: "inline-block",
				maxWidth: 160,
			}}
		>
			{children}
		</motion.div>
	),
);
NodeB.displayName = "NodeB";

// ----- Connector definitions -----
const CONNECTIONS: { from: NodeId; to: NodeId; delay: number }[] = [
	{ from: "root", to: "transport", delay: 0.25 },
	{ from: "root", to: "entertainment", delay: 0.4 },
	{ from: "transport", to: "transportDetail", delay: 0.6 },
	{ from: "entertainment", to: "entertainmentDetail", delay: 0.78 },
	{ from: "root", to: "bills", delay: 0.95 },
	{ from: "bills", to: "billsDetail", delay: 1.15 },
];

export default function CategorizationTree({
	isInView,
}: {
	isInView: boolean;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const [points, setPoints] = useState<Record<string, Point>>({});
	const [size, setSize] = useState({ w: 0, h: 0 });

	const setNodeRef = (id: NodeId) => (el: HTMLDivElement | null) => {
		nodeRefs.current[id] = el;
	};

	useLayoutEffect(() => {
		const measure = () => {
			const container = containerRef.current;
			if (!container) return;
			const cRect = container.getBoundingClientRect();
			setSize({ w: cRect.width, h: cRect.height });

			const next: Record<string, Point> = {};
			for (const id of Object.keys(nodeRefs.current)) {
				const el = nodeRefs.current[id];
				if (!el) continue;
				const r = el.getBoundingClientRect();
				next[id] = {
					topX: r.left - cRect.left + r.width / 2,
					topY: r.top - cRect.top,
					botX: r.left - cRect.left + r.width / 2,
					botY: r.bottom - cRect.top,
				};
			}
			setPoints(next);
		};

		measure();

		const ro = new ResizeObserver(measure);
		if (containerRef.current) ro.observe(containerRef.current);
		window.addEventListener("resize", measure);

		// Re-measure shortly after mount to account for font/layout settling.
		const t = setTimeout(measure, 300);

		return () => {
			ro.disconnect();
			window.removeEventListener("resize", measure);
			clearTimeout(t);
		};
	}, []);

	const haveAllPoints = CONNECTIONS.every(
		(c) => points[c.from] && points[c.to],
	);

	return (
		<div
			ref={containerRef}
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 18,
				position: "relative",
				zIndex: 2,
				height: "100%",
			}}
		>
			{/* SVG connector overlay (behind the nodes) */}
			{haveAllPoints && size.w > 0 && (
				<svg
					width={size.w}
					height={size.h}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						pointerEvents: "none",
						zIndex: 1,
						overflow: "visible",
					}}
				>
					{CONNECTIONS.map((conn, i) => {
						const from = points[conn.from];
						const to = points[conn.to];
						const x1 = from.botX;
						const y1 = from.botY;
						const x2 = to.topX;
						const y2 = to.topY;
						const midY = (y1 + y2) / 2;
						const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
						const pathId = `tree-path-${i}`;

						return (
							<g key={i}>
								<motion.path
									id={pathId}
									d={d}
									stroke="rgba(255,255,255,0.35)"
									strokeWidth={1}
									fill="none"
									initial={{ pathLength: 0, opacity: 0 }}
									animate={isInView ? { pathLength: 1, opacity: 1 } : undefined}
									transition={{
										duration: 0.5,
										ease: "easeOut",
										delay: conn.delay,
									}}
								/>

								{/* Endpoint marker where the line meets the child node */}
								<motion.circle
									cx={x2}
									cy={y2}
									r={2.5}
									fill="rgba(255,255,255,0.9)"
									initial={{ opacity: 0 }}
									animate={isInView ? { opacity: 1 } : undefined}
									transition={{ duration: 0.3, delay: conn.delay + 0.5 }}
								/>

								{/* Traveling glow dot that loops along the path forever */}
								<motion.circle
									r={3}
									fill="#fff"
									initial={{ opacity: 0 }}
									animate={isInView ? { opacity: [0, 1, 1, 0] } : undefined}
									transition={{
										duration: 2.4,
										delay: conn.delay + 0.6,
										repeat: Infinity,
										repeatDelay: 1.2,
										ease: "easeInOut",
										times: [0, 0.1, 0.9, 1],
									}}
									style={{
										filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
									}}
								>
									<animateMotion
										dur="2.4s"
										begin={`${conn.delay + 0.6}s`}
										repeatCount="indefinite"
										keyPoints="0;1"
										keyTimes="0;1"
										calcMode="linear"
									>
										<mpath href={`#${pathId}`} />
									</animateMotion>
								</motion.circle>
							</g>
						);
					})}
				</svg>
			)}

			{/* Row 1 */}
			<NodeA ref={setNodeRef("root")} isInView={isInView} delay={0}>
				Categorization
			</NodeA>

			{/* Row 2 */}
			<div style={{ display: "flex", gap: 16 }}>
				<NodeA ref={setNodeRef("transport")} isInView={isInView} delay={0.18}>
					Transportation
				</NodeA>
				<NodeA
					ref={setNodeRef("entertainment")}
					isInView={isInView}
					delay={0.36}
				>
					Entertainment
				</NodeA>
			</div>

			{/* Row 3 */}
			<div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
				<NodeB
					ref={setNodeRef("transportDetail")}
					isInView={isInView}
					delay={0.54}
				>
					Fuel, rides, car maintenance, public transit
				</NodeB>
				<NodeB
					ref={setNodeRef("entertainmentDetail")}
					isInView={isInView}
					delay={0.72}
				>
					Streaming services, gaming, events
				</NodeB>
			</div>

			{/* Row 4 */}
			<NodeA ref={setNodeRef("bills")} isInView={isInView} delay={0.9}>
				Bills and Utilities
			</NodeA>

			{/* Row 5 */}
			<NodeB ref={setNodeRef("billsDetail")} isInView={isInView} delay={1.08}>
				Electricity, water, gas, internet, phone
			</NodeB>
		</div>
	);
}
