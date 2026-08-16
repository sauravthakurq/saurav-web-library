import { motion } from "framer-motion";
import { useState } from "react";
import SerifGlowWord from "../components/SerifGlowWord";
import { asset, TEXT_COLOR } from "../lib/constants";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_BACK = [0.34, 1.56, 0.64, 1] as const;
const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

// Inter Tight display headline type — shared by "Bags crafted", "to move with"
// and "story".
const HEADLINE_TYPE = {
	fontFamily: "'Inter Tight', sans-serif",
	fontSize: "87.999px",
	fontWeight: 500,
	lineHeight: "80px",
	letterSpacing: "-3.52px",
	color: TEXT_COLOR,
};

/** A bottom-left polaroid thumbnail with a lift-on-hover photo. */
function PolaroidThumb({
	bag,
	tag,
	delay,
	rotate,
}: {
	bag: string;
	tag: string;
	delay: number;
	rotate: number;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: EASE_OUT, delay }}
			style={{
				transform: `rotate(${rotate}deg)`,
				transformOrigin: "bottom center",
			}}
		>
			{/* Tag above the frame */}
			<span
				style={{
					position: "absolute",
					top: -32,
					right: 14,
					zIndex: 3,
					fontFamily: "'Instrument Serif', serif",
					fontSize: "18px",
					fontWeight: 400,
					color: "rgba(84,84,84,0.7)",
					pointerEvents: "none",
				}}
			>
				{tag}
			</span>
			<div
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				style={{
					position: "relative",
					width: 170,
					height: 210,
					filter: "drop-shadow(2px 6px 14px rgba(0,0,0,0.10))",
					transition: "all 0.25s ease",
					transform: hovered ? "translateY(-4px)" : "translateY(0)",
				}}
			>
				{/* Bag image in the photo aperture */}
				<img
					src={asset(bag)}
					alt=""
					style={{
						position: "absolute",
						top: "14%",
						left: "14%",
						width: "72%",
						height: "62%",
						objectFit: "contain",
						zIndex: 1,
					}}
				/>
				{/* Polaroid frame */}
				<img
					src={asset("snap-bare.png")}
					alt=""
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
						objectFit: "contain",
						zIndex: 2,
					}}
				/>
			</div>
		</motion.div>
	);
}

export default function Hero() {
	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				minHeight: "100vh",
				height: "100vh",
				overflow: "hidden",
				background: "#EEEAE3",
				fontFamily: "'Inter Tight', sans-serif",
			}}
		>
			{/* Navbar */}
			<nav
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 50,
					padding: "20px 32px",
					background: "transparent",
					display: "flex",
					justifyContent: "flex-end",
					alignItems: "center",
					gap: 32,
				}}
			>
				{["Catalog", "Favorites", "Cart (0)"].map((link) => (
					<a
						key={link}
						href="#"
						className="transition-opacity duration-200 hover:opacity-60"
						style={{
							fontFamily: "'Inter Tight', sans-serif",
							fontSize: 14,
							fontWeight: 400,
							color: TEXT_COLOR,
							textDecoration: "none",
						}}
					>
						{link}
					</a>
				))}
				<button
					type="button"
					aria-label="Menu"
					className="transition-opacity duration-200 hover:opacity-70"
					style={{
						background: "none",
						border: "none",
						padding: 0,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
					}}
				>
					<img src={asset("burger.svg")} alt="" width={42} height={30} />
				</button>
			</nav>

			{/* Heading block */}
			<div
				style={{
					position: "absolute",
					top: 32,
					left: 40,
					maxWidth: 500,
					zIndex: 10,
				}}
			>
				<motion.div
					initial={{ opacity: 0, filter: "blur(14px)" }}
					animate={{ opacity: 1, filter: "blur(0px)" }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
					style={HEADLINE_TYPE}
				>
					Bags crafted
				</motion.div>
				<motion.div
					initial={{ opacity: 0, filter: "blur(14px)" }}
					animate={{ opacity: 1, filter: "blur(0px)" }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.28 }}
					style={HEADLINE_TYPE}
				>
					to move with
				</motion.div>
				<div
					style={{
						display: "flex",
						alignItems: "baseline",
						gap: 12,
						marginTop: -2,
					}}
				>
					<SerifGlowWord
						word="your"
						fontSize={94.969}
						lineHeight={93.413}
						letterSpacing={-3.799}
						strokeWidth={20.55}
						delay={0.5}
					/>
					<motion.span
						initial={{ opacity: 0, filter: "blur(12px)" }}
						animate={{ opacity: 1, filter: "blur(0px)" }}
						transition={{ duration: 0.7, ease: "easeOut", delay: 0.78 }}
						style={{ ...HEADLINE_TYPE, display: "inline-block" }}
					>
						story
					</motion.span>
				</div>
			</div>

			{/* Woman model */}
			<motion.img
				src={asset("woman.png")}
				alt="Model holding a bag"
				initial={{ opacity: 0, y: 80 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1.1, ease: EASE_SMOOTH, delay: 0.2 }}
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					marginLeft: "auto",
					marginRight: "auto",
					height: "100vh",
					width: "auto",
					objectFit: "contain",
					objectPosition: "bottom center",
					zIndex: 6,
				}}
			/>

			{/* Sticks SVG flourish */}
			<motion.img
				src={asset("sticks.svg")}
				alt=""
				initial={{ opacity: 0, scale: 0, rotate: -180 }}
				animate={{
					opacity: 1,
					scale: [0, 1.4, 0.85, 1.15, 0.95, 1.05, 1],
					rotate: [-180, -20, 25, -15, 10, -5, 0],
					y: [0, -6, 0],
				}}
				transition={{
					opacity: { duration: 0.3, delay: 0.85, ease: "easeOut" },
					scale: { duration: 0.95, delay: 0.85, ease: EASE_BACK },
					rotate: { duration: 0.95, delay: 0.85, ease: EASE_BACK },
					y: {
						duration: 3.2,
						delay: 2,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
				style={{
					position: "absolute",
					top: 24,
					left: "calc(50% + 40px)",
					zIndex: 7,
					width: 32,
					transformOrigin: "bottom center",
				}}
			/>

			{/* Smile sticker */}
			<motion.img
				src={asset("smile.png")}
				alt=""
				initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
				animate={{
					opacity: 1,
					scale: 1,
					rotate: [0, 10, -5, 0],
				}}
				transition={{
					opacity: { duration: 0.5, delay: 1.05, ease: EASE_BACK },
					scale: { duration: 0.5, delay: 1.05, ease: EASE_BACK },
					rotate: {
						duration: 5,
						delay: 1.55,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
				style={{
					position: "absolute",
					top: "calc(55% - 60px)",
					left: "calc(50% - 260px)",
					zIndex: 7,
					width: 60,
					height: 60,
				}}
			/>

			{/* Snap polaroid (centered, in front of model) */}
			<motion.img
				src={asset("snap.png")}
				alt=""
				initial={{ rotateX: -100, scaleY: 0.1, opacity: 0 }}
				animate={{
					rotateX: [-100, -60, -15, 4, -1, 0],
					scaleY: [0.1, 0.35, 0.8, 1.03, 0.99, 1],
					opacity: [0, 0.35, 0.85, 1, 1, 1],
					rotate: [-6, -4, -7, -6],
				}}
				transition={{
					rotateX: {
						duration: 0.65,
						delay: 1.1,
						ease: EASE_SMOOTH,
						times: [0, 0.2, 0.55, 0.78, 0.9, 1],
					},
					scaleY: {
						duration: 0.65,
						delay: 1.1,
						ease: EASE_SMOOTH,
						times: [0, 0.2, 0.55, 0.78, 0.9, 1],
					},
					opacity: {
						duration: 0.65,
						delay: 1.1,
						ease: EASE_SMOOTH,
						times: [0, 0.2, 0.55, 0.78, 0.9, 1],
					},
					rotate: {
						duration: 7,
						delay: 1.8,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
				style={{
					position: "absolute",
					top: "35%",
					left: "calc(50% - 5px)",
					zIndex: 8,
					width: 200,
					transformPerspective: 500,
					transformOrigin: "top center",
				}}
			/>

			{/* Card (gift card to the left of model) */}
			<motion.img
				src={asset("card.png")}
				alt=""
				initial={{ rotateX: -90, scaleY: 0.12, opacity: 0 }}
				animate={{
					rotateX: [-90, -50, -10, 3, 0],
					scaleY: [0.12, 0.5, 0.9, 1.02, 1],
					opacity: [0, 0.4, 0.9, 1, 1],
					rotate: -3,
				}}
				transition={{
					rotateX: {
						duration: 0.6,
						delay: 1.2,
						ease: EASE_SMOOTH,
						times: [0, 0.25, 0.65, 0.85, 1],
					},
					scaleY: {
						duration: 0.6,
						delay: 1.2,
						ease: EASE_SMOOTH,
						times: [0, 0.25, 0.65, 0.85, 1],
					},
					opacity: {
						duration: 0.6,
						delay: 1.2,
						ease: EASE_SMOOTH,
						times: [0, 0.25, 0.65, 0.85, 1],
					},
					rotate: { duration: 0.6, delay: 1.2, ease: EASE_SMOOTH },
				}}
				style={{
					position: "absolute",
					bottom: "22%",
					left: "calc(50% - 170px)",
					zIndex: 9,
					width: 150,
					transformPerspective: 600,
					transformOrigin: "top center",
				}}
			/>

			{/* "elegance" sticker */}
			<div
				style={{
					position: "absolute",
					bottom: "calc(16% + 40px)",
					left: "calc(50% - 100px)",
					zIndex: 10,
					transform: "rotate(6.206deg)",
				}}
			>
				<SerifGlowWord
					word="elegance"
					fontSize={32}
					lineHeight={31}
					letterSpacing={-1.2}
					strokeWidth={10.27}
					italic
					delay={1.35}
				/>
			</div>

			{/* Text-heart sticker */}
			<motion.img
				src={asset("text-heart.png")}
				alt=""
				initial={{ opacity: 0, scale: 0.5, rotate: 18 }}
				animate={{ opacity: 1, scale: 1, rotate: 4 }}
				transition={{ duration: 0.5, delay: 1.3, ease: EASE_BACK }}
				style={{
					position: "absolute",
					top: "57%",
					left: "calc(50% + 150px)",
					zIndex: 7,
					width: 110,
				}}
			/>

			{/* Arrow */}
			<motion.img
				src={asset("arrow.svg")}
				alt=""
				initial={{ opacity: 0, x: 24, rotate: 20 }}
				animate={{ opacity: 0.8, rotate: 0, x: [0, -5, 0] }}
				transition={{
					opacity: { duration: 0.55, delay: 1.4, ease: "easeOut" },
					rotate: { duration: 0.55, delay: 1.4, ease: "easeOut" },
					x: {
						duration: 2.2,
						delay: 2,
						repeat: Infinity,
						ease: "easeInOut",
					},
				}}
				style={{
					position: "absolute",
					top: "44%",
					left: "calc(50% + 250px)",
					zIndex: 7,
					width: 90,
				}}
			/>

			{/* LOVE BAG label (right column) */}
			<motion.div
				initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
				animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
				transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
				style={{
					position: "absolute",
					top: "48%",
					right: 32,
					zIndex: 10,
					maxWidth: 210,
					transform: "translateY(-50%)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<span
						style={{
							fontFamily: "'Inter Tight', sans-serif",
							fontSize: 11,
							fontWeight: 600,
							letterSpacing: "2.5px",
							color: TEXT_COLOR,
						}}
					>
						LOVE BAG
					</span>
					<img src={asset("heart.svg")} alt="" width={13} height={13} />
				</div>
				<p
					style={{
						marginTop: 10,
						fontFamily: "'Inter Tight', sans-serif",
						fontSize: 12,
						fontWeight: 400,
						lineHeight: 1.7,
						color: TEXT_COLOR,
						textAlign: "justify",
					}}
				>
					Crafted with care and designed to follow you from day to night, it
					holds not only your essentials, but your stories
				</p>
			</motion.div>

			{/* Large "(01)" page numeral watermark */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
				style={{
					position: "absolute",
					bottom: 20,
					right: 32,
					zIndex: 4,
					fontFamily: "'Instrument Serif', serif",
					fontSize: "87.999px",
					fontWeight: 400,
					lineHeight: "80px",
					letterSpacing: "-3.52px",
					color: "rgba(84,84,84,0.18)",
				}}
			>
				(01)
			</motion.div>

			{/* Bottom-left polaroid thumbnails */}
			<div
				style={{
					position: "absolute",
					bottom: 24,
					left: 32,
					zIndex: 10,
					display: "flex",
					alignItems: "flex-end",
					gap: 20,
				}}
			>
				<PolaroidThumb bag="bag-1.png" tag="(02)" delay={1.65} rotate={-2} />
				<PolaroidThumb bag="bag-2.png" tag="(03)" delay={1.8} rotate={1.5} />
			</div>
		</div>
	);
}
