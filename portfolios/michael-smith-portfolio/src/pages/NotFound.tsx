import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";

const NotFound = () => (
	<PageTransition>
		<main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
			<p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
				Error 404
			</p>
			<h1 className="mb-8 font-display text-7xl italic leading-[0.9] tracking-tight md:text-9xl">
				Lost in <span className="text-muted">space.</span>
			</h1>
			<p className="mb-12 max-w-md text-sm text-muted md:text-base">
				The page you're looking for doesn't exist — but the work does.
			</p>
			<Link
				to="/"
				className="group relative inline-flex transition-transform duration-300 hover:scale-105"
			>
				<span className="accent-gradient-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				<span className="relative rounded-full bg-text-primary px-7 py-3.5 text-sm font-medium text-bg transition-colors duration-300 group-hover:bg-bg group-hover:text-text-primary">
					Back home
				</span>
			</Link>
		</main>
	</PageTransition>
);

export default NotFound;
