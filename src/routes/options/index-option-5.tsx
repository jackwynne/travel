/**
 * OPTION 5: "The Brutalist Typographer"
 * --------------------------
 * Aesthetic: Bold, brutalist, typography-driven
 * Concept: Massive type dominates every section. The location name in the hero stretches
 *          nearly edge-to-edge at huge sizes. Raw, unpolished borders. High contrast
 *          black & white with a single neon accent (electric lime). The map and places
 *          use stark grid structures. Feels like a contemporary art gallery crossed
 *          with a design studio portfolio.
 *
 * Key design choices:
 *  - Google Font: "Space Mono" for mono-spaced body, "Instrument Serif" for massive headings
 *  - Color: Pure black/white, electric lime accent (#BFFF00)
 *  - Layout: Edge-to-edge type, stark grids, hard borders (no border-radius)
 *  - Motion: Abrupt hover states, sliding underlines, glitch-like transitions
 *  - Unique: Massive viewport-width type, counter-style numbering, raw grid aesthetics
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PlaceCard, PlaceCardSkeleton } from "@/components/PlaceCard";
import { Button } from "@/components/ui/button";
import {
	Map,
	MapMarker,
	MarkerContent,
	MarkerTooltip,
	MapControls,
	useMap,
} from "@/components/ui/map";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	Globe,
	MapPin,
	ChevronRight,
	Settings,
	ArrowUpRight,
	X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OptionsFloatingNav } from "@/components/OptionsFloatingNav";

export const Route = createFileRoute("/options/index-option-5")({
	component: Home,
});

const monoFont = "'Space Mono', 'Courier New', monospace";
const displayFont = "'Instrument Serif', 'Georgia', serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap');

				.brut-accent {
					color: #BFFF00
				}

				.brut-bg-accent {
					background-color: #BFFF00;
					color: #000
				}

				.brut-border {
					border: 2px solid currentColor;
				}

				.brut-heading {
					font-family: ${displayFont};
					line-height: 0.85;
					letter-spacing: -0.03em;
				}

				.brut-mono {
					font-family: ${monoFont};
				}

				.brut-slide-in {
					opacity: 0
					transform: translateX(-40px);
					animation: brutSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}

				@keyframes brutSlide {
					to { opacity: 1; transform: translateX(0); }
				}

				.brut-underline {
					position: relative;
					display: inline-block;
				}

				.brut-underline::after {
					content: ""
					position: absolute;
					bottom: 0
					left: 0
					width: 0
					height: 3px
					background: #BFFF00;
					transition: width 0.3s ease;
				}

				.brut-underline:hover::after {
					width: 100%
				}

				.marquee-track {
					display: flex
					animation: marquee 30s linear infinite;
				}

				@keyframes marquee {
					from { transform: translateX(0); }
					to { transform: translateX(-50%); }
				}
			`}</style>

			<div className="min-h-screen flex flex-col bg-background text-foreground">
				{/* Brutalist Header */}
				<header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
					<div className="px-4 md:px-8">
						<div className="h-14 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-3 group">
								<span
									className="text-sm font-bold tracking-[0.4em] uppercase"
									style={{ fontFamily: monoFont }}
								>
									TRV
								</span>
								<span className="brut-accent text-lg">*</span>
							</Link>
							<div className="flex items-center gap-4">
								<span
									className="hidden md:inline text-xs text-muted-foreground"
									style={{ fontFamily: monoFont }}
								>
									[travel.log]
								</span>
								<ThemeToggle />
							</div>
						</div>
					</div>
				</header>

				<main className="flex-1">
					<HeroSection />
					<MapSection />
					<PlacesSection />
				</main>

				{/* Brutalist Footer */}
				<footer className="border-t-2 border-foreground">
					<div className="px-4 md:px-8 py-8">
						<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<span
									className="text-xs text-muted-foreground"
									style={{ fontFamily: monoFont }}
								>
									// explore the world, one city at a time
								</span>
							</div>
							<Link to="/admin">
								<Button
									variant="outline"
									size="sm"
									className="gap-2 rounded-none border-2 border-foreground text-foreground hover:brut-bg-accent hover:text-black hover:border-[#BFFF00]"
									style={{ fontFamily: monoFont }}
								>
									<Settings className="h-3.5 w-3.5" />
									ADMIN
								</Button>
							</Link>
						</div>
					</div>
				</footer>
			</div>
		</>
	)
}

function HeroSection() {
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (!featuredImages || featuredImages.length <= 1) return;
		const interval = setInterval(() => {
			setActiveIndex((i) => (i + 1) % featuredImages.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [featuredImages]);

	if (featuredImages === undefined) {
		return (
			<section className="h-[80vh] flex items-center justify-center border-b-2 border-foreground">
				<div
					className="text-sm text-muted-foreground animate-pulse"
					style={{ fontFamily: monoFont }}
				>
					loading_
				</div>
			</section>
		)
	}

	if (featuredImages.length === 0) {
		return (
			<section className="py-32 px-4 md:px-8 border-b-2 border-foreground text-center">
				<h2 className="brut-heading text-6xl md:text-8xl text-muted-foreground/30">
					EMPTY
				</h2>
				<p
					className="text-sm text-muted-foreground mt-4"
					style={{ fontFamily: monoFont }}
				>
					// mark images as featured to populate
				</p>
			</section>
		)
	}

	const image = featuredImages[activeIndex];

	return (
		<section className="relative border-b-2 border-foreground">
			{/* Full-bleed image behind */}
			<div className="relative h-[80vh] overflow-hidden">
				{featuredImages.map((img, i) => (
					<img
						key={img._id}
						src={img.url}
						alt={img.description ?? img.locationName}
						className={cn(
							"absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
							i === activeIndex ? "opacity-100" : "opacity-0",
						)}
					/>
				))}

				{/* Heavy overlay */}
				<div className="absolute inset-0 bg-black/60" />

				{/* Massive typography overlay */}
				<div className="absolute inset-0 flex flex-col justify-between p-4 md:p-8">
					{/* Top bar */}
					<div className="flex justify-between items-start">
						<span
							className="text-xs text-white/40"
							style={{ fontFamily: monoFont }}
						>
							{String(activeIndex + 1).padStart(2, "0")}/{String(featuredImages.length).padStart(2, "0")}
						</span>
						<span
							className="text-xs text-[#BFFF00]"
							style={{ fontFamily: monoFont }}
						>
							[FEATURED]
						</span>
					</div>

					{/* Center - Massive title */}
					<div className="brut-slide-in">
						<h1
							className="brut-heading text-white text-[clamp(3rem,12vw,12rem)] uppercase"
						>
							{image.locationName}
						</h1>
					</div>

					{/* Bottom bar */}
					<div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
						<div className="space-y-2">
							{image.description && (
								<p
									className="text-sm text-white/50 max-w-md"
									style={{ fontFamily: monoFont }}
								>
									{image.description}
								</p>
							)}
							{image.countryId && image.cityId && (
								<Link
									to="/country/$countryId/city/$cityId"
									params={{
										countryId: image.countryId,
										cityId: image.cityId,
									}}
									className="inline-flex items-center gap-2 text-[#BFFF00] hover:underline"
									style={{ fontFamily: monoFont }}
								>
									<span className="text-sm font-bold uppercase">Explore</span>
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							)}
						</div>

						{/* Slide selector */}
						<div className="flex gap-3">
							{featuredImages.map((_, i) => (
								<button
									key={i}
									type="button"
									onClick={() => setActiveIndex(i)}
									className={cn(
										"w-8 h-8 border-2 text-xs transition-all",
										i === activeIndex
											? "border-[#BFFF00] text-[#BFFF00] bg-[#BFFF00]/10"
											: "border-white/20 text-white/30 hover:border-white/50",
									)}
									style={{ fontFamily: monoFont }}
								>
									{String(i + 1).padStart(2, "0")}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

function MapSection() {
	const countriesWithCities = useQuery(
		api.functions.homepage.getCountriesWithCities,
	)
	const [selectedCountry, setSelectedCountry] = useState<Id<"country"> | null>(
		null,
	)
	const navigate = useNavigate();

	const filteredCities =
		countriesWithCities?.flatMap((country) =>
			selectedCountry === null || selectedCountry === country._id
				? country.cities.map((city) => ({ ...city, countryId: country._id }))
				: [],
		) ?? [];

	if (countriesWithCities === undefined) {
		return (
			<section className="py-16 px-4 md:px-8 border-b-2 border-foreground">
				<Skeleton className="h-[500px]" />
			</section>
		)
	}

	return (
		<section className="border-b-2 border-foreground">
			{/* Section header with marquee */}
			<div className="border-b-2 border-foreground py-4 overflow-hidden">
				<div className="marquee-track">
					{[...Array(4)].map((_, i) => (
						<span
							key={i}
							className="brut-heading text-5xl md:text-7xl uppercase whitespace-nowrap px-8 text-foreground/10"
						>
							Destinations &mdash; Destinations &mdash;&nbsp;
						</span>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-5">
				{/* Country list - stark */}
				<div className="lg:col-span-1 border-r-0 lg:border-r-2 border-b-2 lg:border-b-0 border-foreground">
				<OptionsFloatingNav currentKey="5" />
					<div
						className="p-4 border-b-2 border-foreground text-xs font-bold tracking-[0.3em] uppercase text-muted-foreground"
						style={{ fontFamily: monoFont }}
					>
						Filter
					</div>
					<div>
						<button
							type="button"
							onClick={() => setSelectedCountry(null)}
							className={cn(
								"w-full text-left px-4 py-3 border-b border-foreground/10 transition-colors flex justify-between items-center",
								selectedCountry === null
									? "brut-bg-accent font-bold"
									: "hover:bg-muted/50",
							)}
							style={{ fontFamily: monoFont }}
						>
							<span className="text-xs uppercase">All</span>
							<span className="text-xs">{countriesWithCities.reduce((s, c) => s + c.cityCount, 0)}</span>
						</button>
						{countriesWithCities.map((country) => (
							<button
								key={country._id}
								type="button"
								onClick={() => setSelectedCountry(country._id)}
								className={cn(
									"w-full text-left px-4 py-3 border-b border-foreground/10 transition-colors flex justify-between items-center",
									selectedCountry === country._id
										? "brut-bg-accent font-bold"
										: "hover:bg-muted/50",
								)}
								style={{ fontFamily: monoFont }}
							>
								<span className="text-xs uppercase">{country.name}</span>
								<span className="text-xs">{country.cityCount}</span>
							</button>
						))}
					</div>
				</div>

				{/* Map */}
				<div className="lg:col-span-4 h-[500px]">
					<Map center={[10, 45]} zoom={3} maxZoom={12}>
						<MapControls position="bottom-right" showZoom showCompass />
						<MapBoundsFitter cities={filteredCities} />
						{filteredCities.map((city) => (
							<MapMarker
								key={city._id}
								longitude={city.lng}
								latitude={city.lat}
								onClick={() => {
									navigate({
										to: "/country/$countryId/city/$cityId",
										params: {
											countryId: city.countryId,
											cityId: city._id,
										},
									})
								}}
							>
								<MarkerContent>
									<div className="relative group cursor-pointer">
										<div className="h-4 w-4 bg-[#BFFF00] rotate-45 border-2 border-black transition-transform group-hover:rotate-0 group-hover:scale-125" />
									</div>
								</MarkerContent>
								<MarkerTooltip>
									<span
										className="text-xs font-bold uppercase"
										style={{ fontFamily: monoFont }}
									>
										{city.name}
									</span>
								</MarkerTooltip>
							</MapMarker>
						))}
					</Map>
				</div>
			</div>
		</section>
	)
}

function MapBoundsFitter({
	cities,
}: {
	cities: Array<{ lng: number; lat: number }>;
}) {
	const { map, isLoaded } = useMap();

	useEffect(() => {
		if (!map || !isLoaded || cities.length === 0) return;

		const bounds = cities.reduce(
			(acc, city) => ({
				minLng: Math.min(acc.minLng, city.lng),
				maxLng: Math.max(acc.maxLng, city.lng),
				minLat: Math.min(acc.minLat, city.lat),
				maxLat: Math.max(acc.maxLat, city.lat),
			}),
			{
				minLng: Number.POSITIVE_INFINITY,
				maxLng: Number.NEGATIVE_INFINITY,
				minLat: Number.POSITIVE_INFINITY,
				maxLat: Number.NEGATIVE_INFINITY,
			},
		)

		map.fitBounds(
			[
				[bounds.minLng, bounds.minLat],
				[bounds.maxLng, bounds.maxLat],
			],
			{ padding: 60, duration: 800 },
		)
	}, [map, isLoaded, cities]);

	return null;
}

function PlacesSection() {
	const recentPlaces = useQuery(api.functions.homepage.getRecentPlaces);

	if (recentPlaces === undefined) {
		return (
			<section className="py-16 px-4 md:px-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(8)].map((_, i) => (
						<PlaceCardSkeleton key={i} />
					))}
				</div>
			</section>
		)
	}

	if (recentPlaces.length === 0) return null;

	return (
		<section>
			{/* Section header */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-6 flex items-end justify-between">
				<div>
					<span
						className="text-xs text-muted-foreground block mb-2"
						style={{ fontFamily: monoFont }}
					>
						// latest additions
					</span>
					<h2 className="brut-heading text-4xl md:text-6xl uppercase">
						Recent<span className="brut-accent">.</span>
					</h2>
				</div>
				<span
					className="text-xs text-muted-foreground"
					style={{ fontFamily: monoFont }}
				>
					[{recentPlaces.length} entries]
				</span>
			</div>

			{/* Grid of place cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{recentPlaces.slice(0, 12).map((place, i) => (
					<div
						key={place._id}
						className="border-b border-r border-foreground/10 brut-slide-in"
						style={{ animationDelay: `${i * 0.05}s` }}
					>
						<PlaceCard place={place} className="h-full rounded-none" />
					</div>
				))}
			</div>
		</section>
	)
}
