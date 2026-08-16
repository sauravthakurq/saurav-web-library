import {
	type MotionValue,
	motion,
	useMotionValue,
	useMotionValueEvent,
	useScroll,
	useTransform,
} from "framer-motion";
import { type RefObject, useEffect, useState } from "react";
import { useViewport, type Viewport } from "../hooks/useViewport";
import {
	CARD_SIZE,
	CARD_SRCS,
	CASCADE,
	getTimeForProgress,
	HERO_ROW_Y,
	hoverEase,
	SLOTS,
	smoothEase,
} from "../lib/cards";

/* ------------------------------------------------------------------ *
 * Intro choreography timing (see prompt). All in seconds.
 * ------------------------------------------------------------------ */
const introDelay = 0.8;
const introDuration = 0.72; // rise from below center to viewport center
const travelToRightDuration = 0.6; // fly to slot 6 (rightmost)
const sweepLeftDuration = 1.6; // sweep across to slot 0 (leftmost)
const totalDuration = introDuration + travelToRightDuration + sweepLeftDuration;
const sweepStart = introDelay + introDuration + travelToRightDuration;

/* ------------------------------------------------------------------ *
 * Shared card chrome — identical markup for intro + scroll-linked modes.
 * ------------------------------------------------------------------ */
function cardShellStyle(z: number): React.CSSProperties {
	return {
		position: "absolute",
		top: 0,
		left: 0,
		width: CARD_SIZE,
		height: CARD_SIZE,
		borderRadius: 18,
		overflow: "hidden",
		boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
		zIndex: z,
		willChange: "transform",
	};
}

function CardImage({ src }: { src: string }) {
	return (
		<img
			src={src}
			alt=""
			draggable={false}
			style={{
				width: "100%",
				height: "100%",
				objectFit: "cover",
				display: "block",
			}}
		/>
	);
}

/* ------------------------------------------------------------------ *
 * Lead card (index 0 / card-1.png): three-phase choreographed entrance.
 * Its onAnimationComplete flips the overlay into scroll-linked mode.
 * ------------------------------------------------------------------ */
function LeadIntroCard({
	vp,
	hovered,
	setHovered,
	onComplete,
}: {
	vp: Viewport;
	hovered: boolean;
	setHovered: (v: boolean) => void;
	onComplete: () => void;
}) {
	const slot6 = SLOTS[6];
	const slot0 = SLOTS[0];

	return (
		<motion.div
			style={cardShellStyle(hovered ? 30 : slot0.z)}
			initial={false}
			animate={{
				x: [vp.w / 2, vp.w / 2, vp.w / 2 + slot6.x, vp.w / 2 + slot0.x],
				y: [
					vp.h / 2 + 180,
					HERO_ROW_Y,
					HERO_ROW_Y + slot6.y,
					HERO_ROW_Y + slot0.y,
				],
				rotate: [0, 0, slot6.rotate, slot0.rotate],
				scale: [0.3, 1, slot6.scale, slot0.scale],
				opacity: [0, 1, 1, 1],
			}}
			transition={{
				delay: introDelay,
				duration: totalDuration,
				times: [
					0,
					introDuration / totalDuration,
					(introDuration + travelToRightDuration) / totalDuration,
					1,
				],
				ease: [smoothEase, smoothEase, smoothEase],
			}}
			onAnimationComplete={onComplete}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			whileHover={{ transition: { duration: 0.2, ease: hoverEase } }}
		>
			<CardImage src={CARD_SRCS[0]} />
		</motion.div>
	);
}

/* ------------------------------------------------------------------ *
 * Follower intro cards (indices 1..6): sit at their fan slot from the
 * start (no movement) and fade in exactly when the lead card sweeps past.
 * ------------------------------------------------------------------ */
function FollowerIntroCard({
	index,
	vp,
	revealed,
	onRevealed,
	hovered,
	setHovered,
}: {
	index: number;
	vp: Viewport;
	revealed: boolean;
	onRevealed: () => void;
	hovered: boolean;
	setHovered: (v: boolean) => void;
}) {
	const slot = SLOTS[index];

	// Reveal timing: invert the smoothEase curve so the fade matches when the
	// lead card visually passes this slot during the left sweep.
	const progress = (slot.x - SLOTS[6].x) / (SLOTS[0].x - SLOTS[6].x); // 0 at slot6 … 1 at slot0
	const revealTime = getTimeForProgress(progress, smoothEase);
	const revealDelay = sweepStart + revealTime * sweepLeftDuration;
	const revealDuration = index <= 3 ? 0.06 : 0.18;

	const cx = vp.w / 2 + slot.x;
	const cy = HERO_ROW_Y + slot.y;

	return (
		<motion.div
			style={{
				...cardShellStyle(hovered ? 30 : slot.z),
				x: cx,
				y: cy,
				rotate: slot.rotate,
				scale: slot.scale,
			}}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={
				revealed
					? // Re-render after the reveal: snappy, no replay of the long delay.
						{ duration: 0.25, ease: hoverEase }
					: { delay: revealDelay, duration: revealDuration, ease: "easeOut" }
			}
			onAnimationComplete={() => {
				if (!revealed) onRevealed();
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			whileHover={{ transition: { duration: 0.2, ease: hoverEase } }}
		>
			<CardImage src={CARD_SRCS[index]} />
		</motion.div>
	);
}

/* ------------------------------------------------------------------ *
 * Scroll-linked card: x/y/rotate/scale are useTransform values driven by
 * a clamped scroll progress. Fan → centered stack → descend → cascade.
 * ------------------------------------------------------------------ */
function ScrollLinkedCard({
	index,
	clamped,
	lp,
	vp,
}: {
	index: number;
	clamped: MotionValue<number>;
	lp: number;
	vp: Viewport;
}) {
	const [hovered, setHovered] = useState(false);

	const slot = SLOTS[index];
	const cascade = CASCADE[index];

	const p1 = lp * 0.33;
	const p2 = lp * 0.66;

	const s1Cx = vp.w / 2 + slot.x; // Section 1 fan center x
	const s1Cy = HERO_ROW_Y + slot.y; // Section 1 fan center y
	const stackCx = vp.w / 2; // mid-transition stack center x
	const stackCy = vp.h / 2; // mid-transition stack center y
	const cascadeLeftRef = vp.w * 0.4;
	const s2Cx = cascadeLeftRef + cascade.left + CARD_SIZE / 2; // Section 2 ladder center x
	const s2Cy = cascade.top + CARD_SIZE / 2; // Section 2 ladder center y

	const x = useTransform(
		clamped,
		[0, p1, p2, lp],
		[s1Cx, stackCx, stackCx, s2Cx],
	);
	const y = useTransform(clamped, [0, p1, p2, lp], [s1Cy, stackCy, s2Cy, s2Cy]);
	const rotate = useTransform(
		clamped,
		[0, p1, lp],
		[slot.rotate, 0, cascade.rotate],
	);
	const scaleX = useTransform(clamped, [0, p1, lp], [slot.scale, 1, 1]);
	const scaleY = useTransform(clamped, [0, p1, lp], [slot.scale, 1, 1]);

	return (
		<motion.div
			style={{
				...cardShellStyle(hovered ? 30 : cascade.z),
				x,
				y,
				rotate,
				scaleX,
				scaleY,
				pointerEvents: "auto",
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			whileHover={{ transition: { duration: 0.2, ease: hoverEase } }}
		>
			<CardImage src={CARD_SRCS[index]} />
		</motion.div>
	);
}

/* ------------------------------------------------------------------ *
 * ScrollCards — global overlay owning all seven artwork cards.
 * ------------------------------------------------------------------ */
export default function ScrollCards({
	containerRef,
}: {
	containerRef: RefObject<HTMLDivElement | null>;
}) {
	const vp = useViewport();

	// useScroll bound to the page container ref (start start → end end). The
	// container *is* the full scroll surface; we also drive progress from a
	// window scroll listener below so the value is reliable even before the
	// container ref hydrates (the two agree because the container is top-anchored
	// and the same height as the document).
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	// Lock geometry, measured from the document on mount / resize / layout settle.
	const [lockProgress, setLockProgress] = useState(0.5);
	const [scrollableHeight, setScrollableHeight] = useState(1);

	// Live scroll progress mirror + clamped-to-lock progress for the cards.
	const [currentProgress, setCurrentProgress] = useState(0);
	const clamped = useMotionValue(0);
	const lp = Math.max(lockProgress, 0.05);

	useEffect(() => {
		let scrollable = 1;
		let lockP = 0.5;

		const measure = () => {
			const container = containerRef.current;
			const sectionTwo = document.querySelector<HTMLElement>(
				'[data-section="two"]',
			);
			if (!container || !sectionTwo) return;

			const containerTop =
				container.getBoundingClientRect().top + window.scrollY;
			const containerScrollHeight = container.scrollHeight;
			const innerHeight = window.innerHeight;
			scrollable = Math.max(1, containerScrollHeight - innerHeight);
			const sectionTwoTop =
				sectionTwo.getBoundingClientRect().top + window.scrollY;

			const raw = (sectionTwoTop - containerTop) / scrollable;
			lockP = Math.min(0.99, Math.max(0.05, raw));

			setScrollableHeight(scrollable);
			setLockProgress(lockP);
			onScroll(); // re-sync progress against fresh geometry
		};

		const onScroll = () => {
			const v = Math.min(1, Math.max(0, window.scrollY / scrollable));
			setCurrentProgress(v);
			clamped.set(Math.min(v, Math.max(lockP, 0.05)));
		};

		measure();
		const t = window.setTimeout(measure, 300); // let layout settle
		window.addEventListener("resize", measure);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.clearTimeout(t);
			window.removeEventListener("resize", measure);
			window.removeEventListener("scroll", onScroll);
		};
	}, [containerRef, clamped]);

	// Also honour framer-motion's own scrollYProgress whenever it does update
	// (keeps the two perfectly in lock-step if/when the ref-based source fires).
	useMotionValueEvent(scrollYProgress, "change", (v) => {
		if (v <= 0) return; // ignore the stuck-at-zero pre-hydration value
		setCurrentProgress(v);
		clamped.set(Math.min(v, lp));
	});

	// Intro lifecycle state.
	const [introDone, setIntroDone] = useState(false);
	const [revealed, setRevealed] = useState<boolean[]>(() =>
		Array(7).fill(false),
	);

	// Safety net: framer-motion's onAnimationComplete can be swallowed under
	// React StrictMode's double-mount. Flip to scroll-linked mode once the full
	// choreography has had time to play (lead entrance + the follower sweep tail),
	// so the page never gets stuck in intro mode. The lead card's own
	// onAnimationComplete still fires this earlier on the happy path.
	useEffect(() => {
		const fullIntro = (introDelay + totalDuration + 0.4) * 1000;
		const id = window.setTimeout(() => setIntroDone(true), fullIntro);
		return () => window.clearTimeout(id);
	}, []);
	// One hover slot for the intro (lead card uses its own; followers share).
	const [leadHovered, setLeadHovered] = useState(false);
	const [hoveredFollower, setHoveredFollower] = useState<number | null>(null);

	const markRevealed = (i: number) =>
		setRevealed((prev) => {
			if (prev[i]) return prev;
			const next = prev.slice();
			next[i] = true;
			return next;
		});

	// ----------------------------------------------------------------
	// INTRO MODE — non-interactive fixed full-viewport layer, z-index 5.
	// ----------------------------------------------------------------
	if (!introDone) {
		return (
			<div
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 5,
					pointerEvents: "none",
				}}
				aria-hidden
			>
				{/* Follower cards (slots 1..6) fade in as the lead sweeps past. */}
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<FollowerIntroCard
						key={`card-${i}`}
						index={i}
						vp={vp}
						revealed={revealed[i]}
						onRevealed={() => markRevealed(i)}
						hovered={hoveredFollower === i}
						setHovered={(v) => setHoveredFollower(v ? i : null)}
					/>
				))}
				{/* Lead card (slot 0 / card-1) plays the three-phase entrance. */}
				<LeadIntroCard
					key="card-0"
					vp={vp}
					hovered={leadHovered}
					setHovered={setLeadHovered}
					onComplete={() => setIntroDone(true)}
				/>
			</div>
		);
	}

	// ----------------------------------------------------------------
	// SCROLL-LINKED MODE — wrapper toggles fixed ↔ absolute at the lock.
	// Cards stay mounted with stable keys so React never remounts them.
	// ----------------------------------------------------------------
	const isLocked = currentProgress >= lp;
	const wrapperStyle: React.CSSProperties = isLocked
		? {
				position: "absolute",
				top: lp * scrollableHeight,
				left: 0,
				width: "100%",
				height: vp.h,
				zIndex: 5,
			}
		: { position: "fixed", inset: 0, zIndex: 5 };

	return (
		<div
			data-progress={currentProgress.toFixed(3)}
			data-locked={String(isLocked)}
			style={{ ...wrapperStyle, pointerEvents: "none" }}
		>
			{CARD_SRCS.map((_, i) => (
				<ScrollLinkedCard
					key={`card-${i}`}
					index={i}
					clamped={clamped}
					lp={lp}
					vp={vp}
				/>
			))}
		</div>
	);
}
