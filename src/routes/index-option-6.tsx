/**
 * OPTION 6: "The Cartographer"
 * --------------------------
 * Aesthetic: Topographic/cartographic — data visualization meets exploration tool
 * Concept: The map IS the hero. The page opens with a full-viewport interactive map
 *          with contour-line inspired decorative elements. Featured destinations appear
 *          as floating cards over the map. The rest of the page uses a two-tone color
 *          scheme inspired by nautical charts — deep navy and warm parchment. Places
 *          are shown in a horizontal scrolling strip like a film contact sheet.
 *
 * Key design choices:
 *  - Google Font: "Overpass Mono" for labels/data, "Fraunces" for display headings
 *  - Color: Deep navy (#0F1729), warm parchment (#F5F0E8), coral accent (#E8614D)
 *  - Layout: Map-first (60vh hero map), floating info panels, horizontal scroll places
 *  - Motion: Smooth card float-in, map marker pulse, horizontal scroll momentum
 *  - Unique: Contour line decorative borders, coordinate readouts, compass rose motif
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
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
	Plane,
	ChevronRight,
	Settings,
	ArrowUpRight,
	Compass,
	Navigation,
	ChevronLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/index-option-6")({
	component: Home,
});

const monoFont = "'Overpass Mono', 'Courier New', monospace";
const displayFont = "'Fraunces', 'Georgia', serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=Overpass+Mono:wght@300;400;600;700&display=swap');

				.carto-navy { background-color: #0F1729; color: #F5F0E8; }
				.carto-parchment { background-color: #F5F0E8; color: #0F1729; }

				.dark .carto-parchment { background-color: #1a1d2e; color: #d4cfc5; }
				.dark .carto-navy { background-color: #0a0d1a; color: #d4cfc5; }

				.carto-coral { color: #E8614D; }
				.carto-bg-coral { background-color: #E8614D; color: white; }

				.carto-heading {
					font-family: ${displayFont};
					font-optical-sizing: auto;
				}

				.carto-mono {
					font-family: ${monoFont};
				}

				.carto-float {
					opacity: 0;
					transform: translateY(12px);
					animation: cartoFloat 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
				}

				@keyframes cartoFloat {
					to { opacity: 1; transform: translateY(0); }
				}

				.contour-border {
					border-image: repeating-linear-gradient(
						90deg,
						#E8614D33 0px,
						#E8614D33 4px,
						transparent 4px,
						transparent 8px
					) 1;
				}

				.carto-stripe {
					background: repeating-linear-gradient(
						-45deg,
						transparent,
						transparent 4px,
						rgba(232, 97, 77, 0.04) 4px,
						rgba(232, 97, 77, 0.04) 8px
					);
				}

				.dark .carto-stripe {
					background: repeating-linear-gradient(
						-45deg,
						transparent,
						transparent 4px,
						rgba(232, 97, 77, 0.06) 4px,
						rgba(232, 97, 77, 0.06) 8px
					);
				}

				.carto-pulse {
					animation: cartoPulse 2s ease-in-out infinite;
				}

				@keyframes cartoPulse {
					0%, 100% { box-shadow: 0 0 0 0 rgba(232, 97, 77, 0.4); }
					50% { box-shadow: 0 0 0 8px rgba(232, 97, 77, 0); }
				}

				.carto-scroll::-webkit-scrollbar { height: 4px; }
				.carto-scroll::-webkit-scrollbar-track { background: transparent; }
				.carto-scroll::-webkit-scrollbar-thumb { background: #E8614D44; border-radius: 2px; }

				.carto-compass {
					animation: compassSpin 60s linear infinite;
				}

				@keyframes compassSpin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>

			<div className="min-h-screen flex flex-col bg-background">
				{/* Header */}
				<header className="sticky top-0 z-50 carto-navy border-b border-[#F5F0E8]/10">
					<div className="container mx-auto px-4 md:px-8">
						<div className="h-12 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-3 group">
								<Navigation className="h-4 w-4 text-[#E8614D] carto-compass" />
								<span
									className="text-sm font-semibold tracking-[0.2em] uppercase text-[#F5F0E8]"
									style={{ fontFamily: monoFont }}
								>
									Travel
								</span>
							</Link>
							<div className="flex items-center gap-4">
								<span
									className="hidden md:inline text-[10px] text-[#F5F0E8]/30 tracking-[0.1em]"
									style={{ fontFamily: monoFont }}
								>
									personal cartography
								</span>
								<ThemeToggle />
							</div>
						</div>
					</div>
				</header>

				<main className="flex-1">
					<HeroMapSection />
					<PlacesSection />
				</main>

				{/* Footer */}
				<footer className="carto-navy border-t border-[#F5F0E8]/10">
					<div className="container mx-auto px-4 md:px-8 py-8">
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<Compass className="h-4 w-4 text-[#E8614D]/50" />
								<span
									className="text-[10px] text-[#F5F0E8]/40 tracking-[0.1em]"
									style={{ fontFamily: monoFont }}
								>
									Explore the world, one city at a time
								</span>
							</div>
							<Link to="/admin">
								<Button
									variant="outline"
									size="sm"
									className="gap-2 rounded-sm border-[#F5F0E8]/10 text-[#F5F0E8]/50 hover:text-[#F5F0E8] hover:border-[#E8614D] bg-transparent text-[10px] tracking-[0.1em]"
									style={{ fontFamily: monoFont }}
								>
									<Settings className="h-3 w-3" />
									Admin
								</Button>
							</Link>
						</div>
					</div>
				</footer>
			</div>
		</>
	)
}

function HeroMapSection() {
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);
	const countriesWithCities = useQuery(
		api.functions.homepage.getCountriesWithCities,
	)
	const [selectedCountry, setSelectedCountry] = useState<Id<"country"> | null>(
		null,
	)
	const [activeFeature, setActiveFeature] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		if (!featuredImages || featuredImages.length <= 1) return;
		const interval = setInterval(() => {
			setActiveFeature((i) => (i + 1) % featuredImages.length);
		}, 6000);
		return () => clearInterval(interval);
	}, [featuredImages]);

	const filteredCities =
		countriesWithCities?.flatMap((country) =>
			selectedCountry === null || selectedCountry === country._id
				? country.cities.map((city) => ({ ...city, countryId: country._id }))
				: [],
		) ?? [];

	const image = featuredImages?.[activeFeature];

	return (
		<section className="relative">
			{/* Map takes full width */}
			<div className="relative h-[70vh] min-h-[500px]">
				{countriesWithCities === undefined ? (
					<div className="h-full bg-muted flex items-center justify-center">
						<span
							className="text-xs text-muted-foreground animate-pulse"
							style={{ fontFamily: monoFont }}
						>
							Loading map...
						</span>
					</div>
				) : (
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
									<div className="group cursor-pointer">
										<div className="h-3.5 w-3.5 rounded-full bg-[#E8614D] border-2 border-white shadow-md carto-pulse transition-transform group-hover:scale-150" />
									</div>
								</MarkerContent>
								<MarkerTooltip>
									<span
										className="text-xs font-semibold"
										style={{ fontFamily: monoFont }}
									>
										{city.name}
									</span>
								</MarkerTooltip>
							</MapMarker>
						))}
					</Map>
				)}

				{/* Floating featured card — bottom-left */}
				{image && (
					<div className="absolute bottom-6 left-4 md:left-8 z-10 carto-float">
						<div className="w-[340px] md:w-[400px] rounded-lg overflow-hidden shadow-2xl bg-background border border-border/50">
							{/* Image strip */}
							<div className="relative h-40 overflow-hidden">
								{featuredImages?.map((img, i) => (
									<img
										key={img._id}
										src={img.url}
										alt={img.description ?? img.locationName}
										className={cn(
											"absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
											i === activeFeature ? "opacity-100" : "opacity-0",
										)}
									/>
								))}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
								<div className="absolute top-3 left-3">
									<span
										className="px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase bg-[#E8614D] text-white rounded-sm"
										style={{ fontFamily: monoFont }}
									>
										Featured
									</span>
								</div>
							</div>

							<div className="p-4 space-y-2">
								<h3
									className="text-xl font-semibold carto-heading"
								>
									{image.locationName}
								</h3>
								{image.description && (
									<p className="text-xs text-muted-foreground line-clamp-2">
										{image.description}
									</p>
								)}
								<div className="flex items-center justify-between pt-1">
									{image.countryId && image.cityId && (
										<Link
											to="/country/$countryId/city/$cityId"
											params={{
												countryId: image.countryId,
												cityId: image.cityId,
											}}
											className="inline-flex items-center gap-1.5 text-[#E8614D] hover:underline"
										>
											<span
												className="text-[10px] font-semibold uppercase tracking-[0.1em]"
												style={{ fontFamily: monoFont }}
											>
												Explore
											</span>
											<ArrowUpRight className="h-3 w-3" />
										</Link>
									)}
									{/* Dots */}
									<div className="flex gap-1.5">
										{featuredImages?.map((_, i) => (
											<button
												key={i}
												type="button"
												onClick={() => setActiveFeature(i)}
												className={cn(
													"h-1.5 rounded-full transition-all",
													i === activeFeature
														? "w-5 bg-[#E8614D]"
														: "w-1.5 bg-muted-foreground/20",
												)}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Floating country filter — top-right */}
				{countriesWithCities && (
					<div className="absolute top-4 right-4 md:right-8 z-10 carto-float" style={{ animationDelay: "0.2s" }}>
						<div className="bg-background/90 backdrop-blur-md rounded-lg border border-border/50 shadow-lg p-3 min-w-[180px]">
							<span
								className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground block mb-2"
								style={{ fontFamily: monoFont }}
							>
								Filter by country
							</span>
							<div className="space-y-0.5 max-h-[250px] overflow-y-auto">
								<button
									type="button"
									onClick={() => setSelectedCountry(null)}
									className={cn(
										"w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex justify-between",
										selectedCountry === null
											? "bg-[#E8614D]/10 text-[#E8614D] font-semibold"
											: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
									)}
									style={{ fontFamily: monoFont }}
								>
									<span>All</span>
									<span className="opacity-50">
										{countriesWithCities.reduce((s, c) => s + c.cityCount, 0)}
									</span>
								</button>
								{countriesWithCities.map((country) => (
									<button
										key={country._id}
										type="button"
										onClick={() => setSelectedCountry(country._id)}
										className={cn(
											"w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex justify-between",
											selectedCountry === country._id
												? "bg-[#E8614D]/10 text-[#E8614D] font-semibold"
												: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
										)}
										style={{ fontFamily: monoFont }}
									>
										<span>{country.name}</span>
										<span className="opacity-50">{country.cityCount}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Contour-style divider strip */}
			<div className="carto-stripe h-10 flex items-center px-4 md:px-8 border-y border-[#E8614D]/10">
				<div className="flex items-center gap-6 overflow-x-auto">
					<span
						className="text-[9px] text-muted-foreground/50 tracking-[0.15em] uppercase shrink-0"
						style={{ fontFamily: monoFont }}
					>
						{countriesWithCities?.length ?? 0} countries
					</span>
					<span className="text-muted-foreground/20">|</span>
					<span
						className="text-[9px] text-muted-foreground/50 tracking-[0.15em] uppercase shrink-0"
						style={{ fontFamily: monoFont }}
					>
						{countriesWithCities?.reduce((s, c) => s + c.cityCount, 0) ?? 0} cities
					</span>
					<span className="text-muted-foreground/20">|</span>
					<span
						className="text-[9px] text-[#E8614D]/50 tracking-[0.15em] uppercase shrink-0"
						style={{ fontFamily: monoFont }}
					>
						{featuredImages?.length ?? 0} featured
					</span>
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
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollBy = (amount: number) => {
		scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
	};

	if (recentPlaces === undefined) {
		return (
			<section className="py-10 px-4 md:px-8">
				<div className="flex gap-4 overflow-hidden">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="min-w-[220px]">
							<PlaceCardSkeleton />
						</div>
					))}
				</div>
			</section>
		)
	}

	if (recentPlaces.length === 0) return null;

	return (
		<section className="py-10">
			{/* Section header */}
			<div className="container mx-auto px-4 md:px-8 mb-6">
				<div className="flex items-end justify-between">
					<div className="flex items-start gap-3">
						<div className="w-1 h-8 bg-[#E8614D] rounded-full mt-1" />
						<div>
							<span
								className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground block mb-1"
								style={{ fontFamily: monoFont }}
							>
								Recent discoveries
							</span>
							<h2 className="carto-heading text-2xl md:text-3xl font-semibold">
								Latest Places
							</h2>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => scrollBy(-300)}
							className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#E8614D] transition-colors"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => scrollBy(300)}
							className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[#E8614D] transition-colors"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Horizontal scroll strip */}
			<div
				ref={scrollRef}
				className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-8 carto-scroll snap-x snap-mandatory"
			>
				{recentPlaces.map((place, i) => (
					<div
						key={place._id}
						className="min-w-[230px] max-w-[230px] snap-start carto-float shrink-0"
						style={{ animationDelay: `${i * 0.05}s` }}
					>
						<PlaceCard place={place} className="h-full" />
					</div>
				))}
			</div>
		</section>
	)
}
