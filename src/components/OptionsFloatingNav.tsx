import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type OptionsFloatingNavProps = {
	currentKey: string;
};

const OPTIONS = [
	{ key: "original", label: "OG", name: "Original", to: "/options/index-original" },
	{ key: "1", label: "Ed", name: "Editorial", to: "/options/index-option-1" },
	{ key: "1b", label: "Ed+", name: "Editorial Refined", to: "/options/index-option-1b" },
	{ key: "2", label: "Cin", name: "Cinematic", to: "/options/index-option-2" },
	{ key: "3", label: "Jrn", name: "Travel Journal", to: "/options/index-option-3" },
	{ key: "4", label: "Bto", name: "Bento Dashboard", to: "/options/index-option-4" },
	{ key: "5", label: "Bru", name: "Brutalist", to: "/options/index-option-5" },
	{ key: "5b", label: "Bru+", name: "Brutalist Refined", to: "/options/index-option-5b" },
	{ key: "6", label: "Map", name: "Cartographer", to: "/options/index-option-6" },
];

export function OptionsFloatingNav({ currentKey }: OptionsFloatingNavProps) {
	return (
		<div className="fixed bottom-6 right-6 z-[90]">
			<div className="rounded-2xl border border-border/70 bg-background/85 shadow-lg backdrop-blur-md">
				<div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
					Options
				</div>
				<div className="grid grid-cols-3 gap-1 p-2">
					{OPTIONS.map((option) => {
						const isActive = option.key === currentKey;
						return (
							<Link
								key={option.key}
								to={option.to}
								aria-label={`Go to ${option.name}`}
								title={option.name}
								className={cn(
									"group relative flex h-8 w-8 items-center justify-center rounded-md text-[11px] font-semibold transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "text-foreground/70 hover:bg-muted",
								)}
							>
								{option.label}
								<span className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 translate-x-1 shadow-sm transition group-hover:opacity-100 group-hover:translate-x-0">
									{option.name}
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
