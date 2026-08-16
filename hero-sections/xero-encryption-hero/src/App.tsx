import { useEffect, useRef, useState } from "react";

type BeamState = "p1" | "splash" | "p2" | "idle";

const NAV_LINKS = ["Method", "Pricing", "Docs"];

const P1_DURATION = 800;
const SPLASH_DURATION = 800;
const P2_DURATION = 800;
const IDLE_DURATION = 1000;
const HALF_WIDTH = 5; // gradient window half-width, percentage units

export default function App() {
	const [menuOpen, setMenuOpen] = useState(false);

	const pipelineRef = useRef<HTMLDivElement>(null);
	const nodeStackRef = useRef<HTMLDivElement>(null);
	const nodeXRef = useRef<HTMLDivElement>(null);
	const nodeShieldRef = useRef<HTMLDivElement>(null);
	const beamGlowRef = useRef<SVGPathElement>(null);
	const beamCoreRef = useRef<SVGPathElement>(null);
	const gradientRef = useRef<SVGLinearGradientElement>(null);
	const splashRef = useRef<HTMLDivElement>(null);

	const toggleMenu = () => {
		setMenuOpen((prev) => {
			const next = !prev;
			document.body.style.overflow = next ? "hidden" : "";
			return next;
		});
	};

	const closeMenu = () => {
		setMenuOpen(false);
		document.body.style.overflow = "";
	};

	useEffect(() => {
		const pipeline = pipelineRef.current;
		const nodeStack = nodeStackRef.current;
		const nodeX = nodeXRef.current;
		const nodeShield = nodeShieldRef.current;
		const beamGlow = beamGlowRef.current;
		const beamCore = beamCoreRef.current;
		const gradient = gradientRef.current;
		const splash = splashRef.current;

		if (
			!pipeline ||
			!nodeStack ||
			!nodeX ||
			!nodeShield ||
			!beamGlow ||
			!beamCore ||
			!gradient ||
			!splash
		) {
			return;
		}

		/* Recompute the beam path from the live node positions. */
		const computePath = () => {
			const pRect = pipeline.getBoundingClientRect();
			const sRect = nodeStack.getBoundingClientRect();
			const xRect = nodeX.getBoundingClientRect();
			const shRect = nodeShield.getBoundingClientRect();
			const startX = sRect.left + sRect.width / 2 - pRect.left;
			const startY = sRect.top + sRect.height / 2 - pRect.top;
			const midX = xRect.left + xRect.width / 2 - pRect.left;
			const midY = xRect.top + xRect.height / 2 - pRect.top;
			const endX = shRect.left + shRect.width / 2 - pRect.left;
			const endY = shRect.top + shRect.height / 2 - pRect.top;
			const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
			beamGlow.setAttribute("d", d);
			beamCore.setAttribute("d", d);
		};

		computePath();
		window.addEventListener("resize", computePath);

		/* Slide the bright window of the userSpaceOnUse gradient. */
		const setGradientWindow = (percentage: number) => {
			const center = percentage * 100;
			gradient.setAttribute("x1", `${center - HALF_WIDTH}%`);
			gradient.setAttribute("y1", "0%");
			gradient.setAttribute("x2", `${center + HALF_WIDTH}%`);
			gradient.setAttribute("y2", "0%");
		};

		let state: BeamState = "p1";
		let lastStateChange = performance.now();
		let rafId = 0;

		const tick = (now: number) => {
			const elapsed = now - lastStateChange;

			switch (state) {
				case "p1": {
					// Beam travels from the stack node to the X node.
					const p = Math.min(elapsed / P1_DURATION, 1);
					setGradientWindow(p * 0.5);
					nodeStack.classList.toggle("active", p < 0.4);
					if (elapsed >= P1_DURATION) {
						nodeStack.classList.remove("active");
						state = "splash";
						lastStateChange = now;
						beamGlow.style.opacity = "0";
						beamCore.style.opacity = "0";
						splash.classList.add("animate");
					}
					break;
				}
				case "splash": {
					// The impact splash plays; the beam is hidden.
					if (elapsed >= SPLASH_DURATION) {
						state = "p2";
						lastStateChange = now;
						splash.classList.remove("animate");
						beamGlow.style.opacity = "1";
						beamCore.style.opacity = "1";
						setGradientWindow(0.5);
					}
					break;
				}
				case "p2": {
					// Beam travels from the X node to the shield node.
					const p = Math.min(elapsed / P2_DURATION, 1);
					setGradientWindow(0.5 + p * 0.5);
					nodeShield.classList.toggle("active", p > 0.6);
					if (elapsed >= P2_DURATION) {
						nodeShield.classList.remove("active");
						state = "idle";
						lastStateChange = now;
					}
					break;
				}
				case "idle": {
					if (elapsed >= IDLE_DURATION) {
						state = "p1";
						lastStateChange = now;
					}
					break;
				}
			}

			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);

		return () => {
			window.removeEventListener("resize", computePath);
			cancelAnimationFrame(rafId);
		};
	}, []);

	return (
		<>
			<nav>
				<span className="nav-logo">Xero</span>
				<button
					type="button"
					className={`menu-toggle${menuOpen ? " active" : ""}`}
					onClick={toggleMenu}
					aria-label="Toggle navigation menu"
					aria-expanded={menuOpen}
				>
					<span />
					<span />
				</button>
				<div className={`nav-menu${menuOpen ? " active" : ""}`}>
					<ul className="nav-links">
						{NAV_LINKS.map((label) => (
							<li key={label}>
								<a href="#" onClick={closeMenu}>
									{label}
								</a>
							</li>
						))}
					</ul>
					<div className="nav-actions">
						<button type="button" className="btn-login">
							Log in
						</button>
						<button type="button" className="btn-signup">
							Sign up
						</button>
					</div>
				</div>
			</nav>

			<section className="hero-card">
				<div className="hero-grid" aria-hidden="true" />

				<div className="icon-pipeline" ref={pipelineRef}>
					<svg className="beam-svg" aria-hidden="true">
						<defs>
							<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
								<feGaussianBlur
									in="SourceGraphic"
									stdDeviation="2"
									result="blur"
								/>
								<feComposite in="SourceGraphic" in2="blur" operator="over" />
							</filter>
							<linearGradient
								id="beam-gradient"
								gradientUnits="userSpaceOnUse"
								x1="-5%"
								y1="0%"
								x2="5%"
								y2="0%"
								ref={gradientRef}
							>
								<stop offset="0%" stopColor="#b04090" stopOpacity="0" />
								<stop offset="20%" stopColor="#b04090" stopOpacity="0.8" />
								<stop offset="50%" stopColor="#fff" stopOpacity="1" />
								<stop offset="80%" stopColor="#c8a0e0" stopOpacity="0.8" />
								<stop offset="100%" stopColor="#c8a0e0" stopOpacity="0" />
							</linearGradient>
						</defs>
						<g className="beam-glow">
							<path
								ref={beamGlowRef}
								stroke="url(#beam-gradient)"
								strokeWidth="2"
								fill="none"
								filter="url(#glow)"
							/>
						</g>
						<path
							ref={beamCoreRef}
							stroke="url(#beam-gradient)"
							strokeWidth="0.8"
							fill="none"
						/>
					</svg>

					<div
						className="icon-node node-light-right"
						id="node-stack"
						ref={nodeStackRef}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<polygon points="12 2 2 7 12 12 22 7 12 2" />
							<polyline points="2 17 12 22 22 17" />
							<polyline points="2 12 12 17 22 12" />
						</svg>
					</div>

					<div className="pipeline-line" />

					<div className="pipeline-center">
						<div className="splash" ref={splashRef} />
						<div className="icon-node-center" id="node-x" ref={nodeXRef}>
							<svg viewBox="0 0 40 40" aria-hidden="true">
								<path d="M5 4H13L21.2 15.9L17.2 21.7ZM27 4H35L25 18.5L21 12.7ZM22.9 18.3L35 36H27L18.9 24.2ZM13 36H5L15 21.5L19 27.3Z" />
							</svg>
						</div>
					</div>

					<div className="pipeline-line right" />

					<div
						className="icon-node node-light-left"
						id="node-shield"
						ref={nodeShieldRef}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
							<polyline points="9 12 11 14 15 10" />
						</svg>
					</div>
				</div>

				<div className="hero-content">
					<h1 className="hero-heading">
						The simple way
						<strong>encryption your data</strong>
					</h1>
					<p className="hero-sub">
						Fully managed data encrypting service and annotation
						<br />
						platform for teams of all industries.
					</p>
					<a href="#" className="btn-cta">
						Get Started
					</a>
				</div>
			</section>

			<div className="brands">
				<div className="brand-item">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="10" fill="currentColor" />
						<path fill="var(--bg)" d="M8 9h8v2H8zm0 4h6v2H8z" />
					</svg>
					Expedia
				</div>

				<div className="brand-item">
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<circle cx="12" cy="7" r="4" />
						<circle cx="5" cy="16" r="3.5" />
						<circle cx="19" cy="16" r="3.5" />
					</svg>
					asana
				</div>

				<div className="brand-item">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						aria-hidden="true"
					>
						<polyline points="4 8 20 8" />
						<polyline points="4 12 12 12" />
						<polyline points="4 16 20 16" />
					</svg>
					zenefits
				</div>

				<div className="brand-item">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="15.5" cy="8.5" r="2.5" fill="currentColor" />
						<circle
							cx="8.5"
							cy="8.5"
							r="2"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
						<path
							d="M10.5 8.5h2.5"
							stroke="currentColor"
							strokeWidth="1.5"
							fill="none"
						/>
						<path
							d="M15.5 11v3.5M15.5 14.5l-2.5 3M15.5 14.5l2.5 3"
							stroke="currentColor"
							strokeWidth="1.5"
							fill="none"
							strokeLinecap="round"
						/>
					</svg>
					<span>
						HubSp
						<span className="hubspot-dot" />t
					</span>
				</div>

				<div className="brand-item">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" />
						<line x1="12" y1="3" x2="12" y2="21" />
						<line x1="3" y1="12" x2="21" y2="12" />
						<line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
						<line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
					</svg>
					loom
				</div>
			</div>
		</>
	);
}
