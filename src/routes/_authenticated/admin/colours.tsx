import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/_authenticated/admin/colours")({ component: ColorsPage });

// Define all color variables from styles.css with their OKLCH values for both themes
const colorVariables = [
	// Core colors
	{
		name: "background",
		variable: "--background",
		light: "oklch(1 0 0)",
		dark: "oklch(0.145 0 0)",
	},
	{
		name: "foreground",
		variable: "--foreground",
		light: "oklch(0.145 0 0)",
		dark: "oklch(0.985 0 0)",
	},
	{
		name: "card",
		variable: "--card",
		light: "oklch(1 0 0)",
		dark: "oklch(0.205 0 0)",
	},
	{
		name: "card-foreground",
		variable: "--card-foreground",
		light: "oklch(0.145 0 0)",
		dark: "oklch(0.985 0 0)",
	},
	{
		name: "popover",
		variable: "--popover",
		light: "oklch(1 0 0)",
		dark: "oklch(0.205 0 0)",
	},
	{
		name: "popover-foreground",
		variable: "--popover-foreground",
		light: "oklch(0.145 0 0)",
		dark: "oklch(0.985 0 0)",
	},
	{
		name: "primary",
		variable: "--primary",
		light: "oklch(0.59 0.14 242)",
		dark: "oklch(0.68 0.15 237)",
	},
	{
		name: "primary-foreground",
		variable: "--primary-foreground",
		light: "oklch(0.98 0.01 237)",
		dark: "oklch(0.29 0.06 243)",
	},
	{
		name: "secondary",
		variable: "--secondary",
		light: "oklch(0.967 0.001 286.375)",
		dark: "oklch(0.274 0.006 286.033)",
	},
	{
		name: "secondary-foreground",
		variable: "--secondary-foreground",
		light: "oklch(0.21 0.006 285.885)",
		dark: "oklch(0.985 0 0)",
	},
	{
		name: "muted",
		variable: "--muted",
		light: "oklch(0.97 0 0)",
		dark: "oklch(0.269 0 0)",
	},
	{
		name: "muted-foreground",
		variable: "--muted-foreground",
		light: "oklch(0.556 0 0)",
		dark: "oklch(0.708 0 0)",
	},
	{
		name: "accent",
		variable: "--accent",
		light: "oklch(0.59 0.14 242)",
		dark: "oklch(0.68 0.15 237)",
	},
	{
		name: "accent-foreground",
		variable: "--accent-foreground",
		light: "oklch(0.98 0.01 237)",
		dark: "oklch(0.29 0.06 243)",
	},
	{
		name: "destructive",
		variable: "--destructive",
		light: "oklch(0.58 0.22 27)",
		dark: "oklch(0.704 0.191 22.216)",
	},
	{
		name: "destructive-foreground",
		variable: "--destructive-foreground",
		light: "oklch(0.577 0.245 27.325)",
		dark: "oklch(0.637 0.237 25.331)",
	},
	{
		name: "border",
		variable: "--border",
		light: "oklch(0.922 0 0)",
		dark: "oklch(1 0 0 / 10%)",
	},
	{
		name: "input",
		variable: "--input",
		light: "oklch(0.922 0 0)",
		dark: "oklch(1 0 0 / 15%)",
	},
	{
		name: "ring",
		variable: "--ring",
		light: "oklch(0.708 0 0)",
		dark: "oklch(0.556 0 0)",
	},
	// Chart colors
	{
		name: "chart-1",
		variable: "--chart-1",
		light: "oklch(0.83 0.10 230)",
		dark: "oklch(0.83 0.10 230)",
	},
	{
		name: "chart-2",
		variable: "--chart-2",
		light: "oklch(0.75 0.14 233)",
		dark: "oklch(0.75 0.14 233)",
	},
	{
		name: "chart-3",
		variable: "--chart-3",
		light: "oklch(0.68 0.15 237)",
		dark: "oklch(0.68 0.15 237)",
	},
	{
		name: "chart-4",
		variable: "--chart-4",
		light: "oklch(0.59 0.14 242)",
		dark: "oklch(0.59 0.14 242)",
	},
	{
		name: "chart-5",
		variable: "--chart-5",
		light: "oklch(0.50 0.12 243)",
		dark: "oklch(0.50 0.12 243)",
	},
	// Sidebar colors
	{
		name: "sidebar",
		variable: "--sidebar",
		light: "oklch(0.985 0 0)",
		dark: "oklch(0.205 0 0)",
	},
	{
		name: "sidebar-foreground",
		variable: "--sidebar-foreground",
		light: "oklch(0.145 0 0)",
		dark: "oklch(0.985 0 0)",
	},
	{
		name: "sidebar-primary",
		variable: "--sidebar-primary",
		light: "oklch(0.59 0.14 242)",
		dark: "oklch(0.75 0.14 233)",
	},
	{
		name: "sidebar-primary-foreground",
		variable: "--sidebar-primary-foreground",
		light: "oklch(0.98 0.01 237)",
		dark: "oklch(0.29 0.06 243)",
	},
	{
		name: "sidebar-accent",
		variable: "--sidebar-accent",
		light: "oklch(0.59 0.14 242)",
		dark: "oklch(0.68 0.15 237)",
	},
	{
		name: "sidebar-accent-foreground",
		variable: "--sidebar-accent-foreground",
		light: "oklch(0.98 0.01 237)",
		dark: "oklch(0.29 0.06 243)",
	},
	{
		name: "sidebar-border",
		variable: "--sidebar-border",
		light: "oklch(0.922 0 0)",
		dark: "oklch(1 0 0 / 10%)",
	},
	{
		name: "sidebar-ring",
		variable: "--sidebar-ring",
		light: "oklch(0.708 0 0)",
		dark: "oklch(0.556 0 0)",
	},
];

// Convert any CSS color to hex using canvas
function colorToHex(color: string): string {
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "#000000";

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

	const toHex = (n: number) => n.toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function isLight(hex: string): boolean {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return false;

	const r = Number.parseInt(result[1], 16);
	const g = Number.parseInt(result[2], 16);
	const b = Number.parseInt(result[3], 16);

	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.5;
}

function ColorCard({
	name,
	variable,
	lightOklch,
	darkOklch,
	showBothModes,
}: {
	name: string;
	variable: string;
	lightOklch: string;
	darkOklch: string;
	showBothModes: boolean;
}) {
	const [lightHex, setLightHex] = useState<string>("");
	const [darkHex, setDarkHex] = useState<string>("");
	const [currentHex, setCurrentHex] = useState<string>("");
	const [currentOklch, setCurrentOklch] = useState<string>("");

	const computeColors = useCallback(() => {
		// Compute light and dark hex values from oklch
		setLightHex(colorToHex(lightOklch));
		setDarkHex(colorToHex(darkOklch));

		// Get current theme's computed value
		const root = document.documentElement;
		const computedStyle = getComputedStyle(root);
		const oklchValue = computedStyle.getPropertyValue(variable).trim();
		setCurrentOklch(oklchValue);
		setCurrentHex(colorToHex(oklchValue || lightOklch));
	}, [variable, lightOklch, darkOklch]);

	useEffect(() => {
		computeColors();
	}, [computeColors]);

	// Re-calculate when theme changes
	useEffect(() => {
		const observer = new MutationObserver(() => {
			computeColors();
		})

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		})

		return () => observer.disconnect();
	}, [computeColors]);

	if (showBothModes) {
		return (
			<div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
				{/* Dual color swatch */}
				<div className="h-32 w-full relative flex">
					<div
						className="w-1/2 h-full relative flex items-center justify-center"
						style={{ backgroundColor: lightOklch }}
					>
						<span
							className={`text-xs font-mono px-2 py-1 rounded-md ${isLight(lightHex) ? "text-black/70 bg-black/10" : "text-white/70 bg-white/10"}`}
						>
							Light
						</span>
					</div>
					<div
						className="w-1/2 h-full relative flex items-center justify-center"
						style={{ backgroundColor: darkOklch }}
					>
						<span
							className={`text-xs font-mono px-2 py-1 rounded-md ${isLight(darkHex) ? "text-black/70 bg-black/10" : "text-white/70 bg-white/10"}`}
						>
							Dark
						</span>
					</div>
				</div>

				{/* Info section */}
				<div className="p-4 space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-foreground text-sm tracking-tight">
							{name}
						</h3>
						<div className="flex gap-1">
							<div
								className="w-4 h-4 rounded-full border border-border/50 shadow-inner"
								style={{ backgroundColor: lightOklch }}
								title="Light"
							/>
							<div
								className="w-4 h-4 rounded-full border border-border/50 shadow-inner"
								style={{ backgroundColor: darkOklch }}
								title="Dark"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">Variable</span>
							<code className="text-xs font-mono text-foreground/80 bg-muted px-2 py-0.5 rounded">
								{variable}
							</code>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground block">
									Light Hex
								</span>
								<code className="text-xs font-mono text-foreground/80 bg-muted px-2 py-0.5 rounded block text-center">
									{lightHex || "..."}
								</code>
							</div>
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground block">
									Dark Hex
								</span>
								<code className="text-xs font-mono text-foreground/80 bg-muted px-2 py-0.5 rounded block text-center">
									{darkHex || "..."}
								</code>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground block">
									Light OKLCH
								</span>
								<code className="text-[10px] font-mono text-foreground/80 bg-muted px-1.5 py-0.5 rounded block text-center break-all leading-relaxed">
									{lightOklch}
								</code>
							</div>
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground block">
									Dark OKLCH
								</span>
								<code className="text-[10px] font-mono text-foreground/80 bg-muted px-1.5 py-0.5 rounded block text-center break-all leading-relaxed">
									{darkOklch}
								</code>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const isLightColor = currentHex ? isLight(currentHex) : false;

	return (
		<div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
			{/* Color swatch */}
			<div
				className="h-32 w-full relative"
				style={{ backgroundColor: `var(${variable})` }}
			>
				<div
					className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isLightColor ? "text-black/70" : "text-white/70"}`}
				>
					<span className="text-xs font-mono px-2 py-1 rounded-md backdrop-blur-sm bg-black/10 dark:bg-white/10">
						{currentHex || "..."}
					</span>
				</div>
			</div>

			{/* Info section */}
			<div className="p-4 space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-foreground text-sm tracking-tight">
						{name}
					</h3>
					<div
						className="w-5 h-5 rounded-full border border-border/50 shadow-inner"
						style={{ backgroundColor: `var(${variable})` }}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Variable</span>
						<code className="text-xs font-mono text-foreground/80 bg-muted px-2 py-0.5 rounded">
							{variable}
						</code>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Hex</span>
						<code className="text-xs font-mono text-foreground/80 bg-muted px-2 py-0.5 rounded">
							{currentHex || "..."}
						</code>
					</div>

					<div className="flex items-start justify-between gap-2">
						<span className="text-xs text-muted-foreground shrink-0">
							OKLCH
						</span>
						<code className="text-xs font-mono text-foreground/80 bg-muted px-2 py-0.5 rounded text-right break-all leading-relaxed">
							{currentOklch || "..."}
						</code>
					</div>
				</div>
			</div>
		</div>
	)
}

function ColorsPage() {
	const [showBothModes, setShowBothModes] = useState(false);

	const coreColors = colorVariables.filter(
		(c) => !c.name.startsWith("chart-") && !c.name.startsWith("sidebar"),
	)
	const chartColors = colorVariables.filter((c) => c.name.startsWith("chart-"));
	const sidebarColors = colorVariables.filter((c) =>
		c.name.startsWith("sidebar"),
	)

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-foreground tracking-tight">
							Color Palette
						</h1>
						<p className="text-sm text-muted-foreground mt-0.5">
							Design system color tokens from styles.css
						</p>
					</div>
					<div className="flex items-center gap-4">
						<ThemeToggle />
					</div>
				</div>
			</header>

			{/* View Mode Toggle */}
			<div className="max-w-7xl mx-auto px-6 pt-8">
				<div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-xl w-fit mx-auto">
					<button
						type="button"
						onClick={() => setShowBothModes(false)}
						className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							!showBothModes
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Current Theme
					</button>
					<button
						type="button"
						onClick={() => setShowBothModes(true)}
						className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							showBothModes
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Compare Light & Dark
					</button>
				</div>
			</div>

			<main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
				{/* Core Colors */}
				<section>
					<div className="mb-8">
						<h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-primary" />
							Core Colors
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Primary UI colors including backgrounds, text, and interactive
							elements
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{coreColors.map((color) => (
							<ColorCard
								key={color.name}
								name={color.name}
								variable={color.variable}
								lightOklch={color.light}
								darkOklch={color.dark}
								showBothModes={showBothModes}
							/>
						))}
					</div>
				</section>

				{/* Chart Colors */}
				<section>
					<div className="mb-8">
						<h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-chart-3" />
							Chart Colors
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Sequential palette for data visualization and charts
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
						{chartColors.map((color) => (
							<ColorCard
								key={color.name}
								name={color.name}
								variable={color.variable}
								lightOklch={color.light}
								darkOklch={color.dark}
								showBothModes={showBothModes}
							/>
						))}
					</div>
				</section>

				{/* Sidebar Colors */}
				<section>
					<div className="mb-8">
						<h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-sidebar-primary" />
							Sidebar Colors
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Dedicated colors for sidebar navigation components
						</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{sidebarColors.map((color) => (
							<ColorCard
								key={color.name}
								name={color.name}
								variable={color.variable}
								lightOklch={color.light}
								darkOklch={color.dark}
								showBothModes={showBothModes}
							/>
						))}
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="border-t border-border/50 mt-20">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<p className="text-center text-sm text-muted-foreground">
						{showBothModes
							? "Comparing light and dark mode colors side by side"
							: "Toggle dark mode or use 'Compare Light & Dark' to see both themes"}
					</p>
				</div>
			</footer>
		</div>
	)
}
