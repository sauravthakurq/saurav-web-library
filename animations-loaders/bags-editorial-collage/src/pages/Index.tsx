import Collection from "../sections/Collection";
import Hero from "../sections/Hero";
import PerfectMatch from "../sections/PerfectMatch";

/**
 * The single Index page renders the three sections in order with no wrappers and
 * no spacing element between them — every visual rhythm is handled by each
 * section's internal layout. The only global background bleed is the torn-paper
 * bridge from Collection into PerfectMatch.
 */
export default function Index() {
	return (
		<>
			<Hero />
			<Collection />
			<PerfectMatch />
		</>
	);
}
