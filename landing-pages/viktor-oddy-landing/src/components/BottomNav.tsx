import Button from "./Button";

export default function BottomNav() {
	return (
		<nav
			aria-label="Quick actions"
			className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-6 rounded-full bg-white px-8 py-2 shadow-[0_0_0_0.5px_rgba(0,0,0,0.05),0_1px_2px_0_rgba(5,26,36,0.1),0_4px_4px_0_rgba(5,26,36,0.09),0_9px_6px_0_rgba(5,26,36,0.05),0_17px_7px_0_rgba(5,26,36,0.01),0_4px_30px_rgba(0,0,0,0.08)]"
		>
			<a
				href="#top"
				aria-label="Back to top"
				className="font-serif text-2xl font-semibold text-[#051A24]"
			>
				V
			</a>
			<Button
				variant="primary"
				href="https://halaskastudio.com/./book"
				className="px-5 py-2.5"
			>
				Start a chat
			</Button>
		</nav>
	);
}
