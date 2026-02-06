/**
 * OPTION 2: "The Cinematic"
 * --------------------------
 * Aesthetic: Immersive, full-bleed cinematic dark mode
 * Concept: The entire page feels like a film — dark backgrounds, full-width imagery,
 *          parallax-like scroll sections, and a moody atmosphere. Hero takes 100vh
 *          with a Ken Burns effect on the image. Text uses a refined condensed font.
 *          The map section has a dark basemap. Places appear as floating cards over
 *          a dark backdrop.
 *
 * Key design choices:
 *  - Google Font: "Bebas Neue" for headings (cinematic condensed), "Source Serif 4" for body
 *  - Color: Deep blacks, warm amber/gold accents (#D4A574)
 *  - Layout: Full-bleed sections, 100vh hero, cinematic framing
 *  - Motion: Ken Burns zoom on hero, staggered card reveals, smooth scrolling
 *  - Unique: Film-grain overlay, letterbox-style header, countdown-style slide numbers
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
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
	ChevronRight,
	Settings,
	Play,
	ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/index-option-2")({
	component: Home,
});

const headingFont = "'Bebas Neue', 'Impact', sans-serif";
const bodyFont = "'Source Serif 4', 'Georgia', serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

				.cinematic-grain {
					position: fixed;
					inset: 0
					pointer-events: none;
					z-index: 100
					opacity: 0.03
					background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
				}

				.ken-burns {
					animation: kenBurns 20s ease-in-out infinite alternate;
				}

				@keyframes kenBurns {
					0% { transform: scale(1) translate(0, 0); }
					100% { transform: scale(1.08) translate(-1%, -1%); }
				}

				.cinematic-fade {
					opacity: 0
					transform: translateY(32px);
					animation: cinematicFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}

				@keyframes cinematicFade {
					to { opacity: 1; transform: translateY(0); }
				}

				.delay-1 { animation-delay: 0.3s; }
				.delay-2 { animation-delay: 0.6s; }
				.delay-3 { animation-delay: 0.9s; }
				.delay-4 { animation-delay: 1.2s; }

				.scroll-hint {
					animation: scrollBounce 2s ease-in-out infinite;
				}

				@keyframes scrollBounce {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(8px); }
				}

				.amber-glow {
					text-shadow: 0 0 40px rgba(212, 165, 116, 0.3);
				}
			`}</style>

			{/* Film grain overlay */}
			<div className="cinematic-grain" />

			<div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
				{/* Cinematic Header - Minimal, floating */}
				<header className="fixed top-0 left-0 right-0 z-50">
					<div className="container mx-auto px-6 md:px-10">
						<div className="h-20 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-4 group">
								<div className="w-8 h-px bg-[#D4A574] group-hover:w-12 transition-all duration-500" />
								<span
									className="text-lg tracking-[0.5em] uppercase text-white/80"
									style={{ fontFamily: headingFont }}
								>
									Travel
								</span>
							</Link>
							<div className="flex items-center gap-6">
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

				{/* Cinematic Footer */}
				<footer className="border-t border-white/5 bg-[#0a0a0a]">
					<div className="container mx-auto px-6 md:px-10 py-16">
						<div className="flex flex-col md:flex-row items-center justify-between gap-6">
							<p
								className="text-sm tracking-[0.2em] uppercase text-white/30"
								style={{ fontFamily: headingFont }}
							>
								Explore the world, one city at a time
							</p>
							<Link to="/admin">
								<Button
									variant="outline"
									size="sm"
									className="gap-2 rounded-none border-white/10 text-white/50 hover:text-white hover:border-white/30 bg-transparent"
								>
									<Settings className="h-3.5 w-3.5" />
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

function HeroSection() {
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (!featuredImages || featuredImages.length <= 1) return;
		const interval = setInterval(() => {
			setActiveIndex((i) => (i + 1) % featuredImages.length);
		}, 6000);
		return () => clearInterval(interval);
	}, [featuredImages]);

	if (featuredImages === undefined) {
		return (
			<section className="h-screen bg-[#0a0a0a] flex items-center justify-center">
				<div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin" />
			</section>
		)
	}

	if (featuredImages.length === 0) {
		return (
			<section className="h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<h2
						className="text-6xl text-white/20"
						style={{ fontFamily: headingFont }}
					>
						Your Journey Awaits
					</h2>
					<p className="text-white/30" style={{ fontFamily: bodyFont }}>
						Mark images as featured to begin
					</p>
				</div>
			</section>
		)
	}

	const image = featuredImages[activeIndex];

	return (
		<section className="relative h-screen overflow-hidden">
			{/* Background images with Ken Burns */}
			{featuredImages.map((img, i) => (
				<div
					key={img._id}
					className={cn(
						"absolute inset-0 transition-opacity duration-[2000ms]",
						i === activeIndex ? "opacity-100" : "opacity-0",
					)}
				>
					<img
						src={img.url}
						alt={img.description ?? img.locationName}
						className="h-full w-full object-cover ken-burns"
					/>
				</div>
			))}

			{/* Heavy dark overlays for cinematic feel */}
			<div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-black/30" />
			<div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />

			{/* Content */}
			<div className="absolute inset-0 flex items-end">
				<div className="container mx-auto px-6 md:px-10 pb-24 md:pb-32">
					<div className="max-w-3xl space-y-6">
						{/* Slide number */}
						<div className="cinematic-fade flex items-center gap-4">
							<span
								className="text-5xl text-[#D4A574]/60"
								style={{ fontFamily: headingFont }}
							>
								{String(activeIndex + 1).padStart(2, "0")}
							</span>
							<div className="w-12 h-px bg-[#D4A574]/30" />
							<span className="text-xs tracking-[0.3em] uppercase text-white/40">
								{image.imageType === "city" ? "City" : "Place"}
							</span>
						</div>

						{/* Title */}
						<h1
							className="cinematic-fade delay-1 text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-wide amber-glow"
							style={{ fontFamily: headingFont }}
						>
							{image.locationName}
						</h1>

						{/* Description */}
						{image.description && (
							<p
								className="cinematic-fade delay-2 text-lg text-white/50 max-w-lg leading-relaxed"
								style={{ fontFamily: bodyFont }}
							>
								{image.description}
							</p>
						)}

						{/* CTA */}
						{image.countryId && image.cityId && (
							<Link
								to="/country/$countryId/city/$cityId"
								params={{
									countryId: image.countryId,
									cityId: image.cityId,
								}}
								className="cinematic-fade delay-3 inline-flex items-center gap-4 group"
							>
								<div className="w-12 h-12 rounded-full border border-[#D4A574]/40 flex items-center justify-center group-hover:bg-[#D4A574]/20 transition-colors">
									<Play className="h-4 w-4 text-[#D4A574] ml-0.5" />
								</div>
								<span className="text-sm tracking-[0.2em] uppercase text-white/60 group-hover:text-[#D4A574] transition-colors">
									Explore destination
								</span>
							</Link>
						)}
					</div>

					{/* Progress bar */}
					<div className="mt-12 flex gap-2">
						{featuredImages.map((_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setActiveIndex(i)}
								className="h-0.5 flex-1 max-w-16 bg-white/10 overflow-hidden rounded-full"
							>
								<div
									className={cn(
										"h-full bg-[#D4A574] transition-all duration-500",
										i === activeIndex ? "w-full" : "w-0",
									)}
								/>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Scroll hint */}
			<div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-hint">
				<ChevronDown className="h-5 w-5 text-white/20" />
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
			<section className="py-24 bg-[#0a0a0a]">
				<div className="container mx-auto px-6 md:px-10">
					<Skeleton className="h-[600px] bg-white/5" />
				</div>
			</section>
		)
	}

	return (
		<section className="py-24 bg-[#0a0a0a]">
			<div className="container mx-auto px-6 md:px-10">
				<div className="mb-16 text-center">
					<h2
						className="text-5xl md:text-7xl tracking-wide text-white/90 mb-4"
						style={{ fontFamily: headingFont }}
					>
						Destinations
					</h2>
					<div className="w-16 h-px bg-[#D4A574]/40 mx-auto" />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
					{/* Country list */}
					<div className="lg:col-span-1 space-y-0.5">
						<button
							type="button"
							onClick={() => setSelectedCountry(null)}
							className={cn(
								"w-full text-left px-4 py-3 text-sm transition-all",
								selectedCountry === null
									? "text-[#D4A574] bg-white/5"
									: "text-white/40 hover:text-white/70",
							)}
							style={{ fontFamily: bodyFont }}
						>
							All Destinations
						</button>
						{countriesWithCities.map((country) => (
							<button
								key={country._id}
								type="button"
								onClick={() => setSelectedCountry(country._id)}
								className={cn(
									"w-full text-left px-4 py-3 text-sm transition-all flex justify-between",
									selectedCountry === country._id
										? "text-[#D4A574] bg-white/5"
										: "text-white/40 hover:text-white/70",
								)}
								style={{ fontFamily: bodyFont }}
							>
								<span>{country.name}</span>
								<span className="text-white/20">{country.cityCount}</span>
							</button>
						))}
					</div>

					{/* Map */}
					<div className="lg:col-span-4">
						<div className="h-[550px] overflow-hidden border border-white/5">
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
												<div className="h-3 w-3 rounded-full bg-[#D4A574] border-2 border-[#0a0a0a] shadow-lg shadow-[#D4A574]/30 transition-transform group-hover:scale-150" />
												<div className="absolute inset-0 rounded-full bg-[#D4A574]/20 animate-ping" />
											</div>
										</MarkerContent>
										<MarkerTooltip>
											<span className="font-medium text-sm">{city.name}</span>
										</MarkerTooltip>
									</MapMarker>
								))}
							</Map>
						</div>
					</div>
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
			<section className="py-24 bg-[#0a0a0a]">
				<div className="container mx-auto px-6 md:px-10">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{[...Array(8)].map((_, i) => (
							<Skeleton key={i} className="h-64 bg-white/5" />
						))}
					</div>
				</div>
			</section>
		)
	}

	if (recentPlaces.length === 0) return null;

	return (
		<section className="py-24 bg-[#0a0a0a] border-t border-white/5">
			<div className="container mx-auto px-6 md:px-10">
				<div className="mb-16 text-center">
					<h2
						className="text-5xl md:text-7xl tracking-wide text-white/90 mb-4"
						style={{ fontFamily: headingFont }}
					>
						Recent Discoveries
					</h2>
					<div className="w-16 h-px bg-[#D4A574]/40 mx-auto" />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{recentPlaces.slice(0, 12).map((place, i) => (
						<div
							key={place._id}
							className="cinematic-fade"
							style={{ animationDelay: `${i * 0.08}s` }}
						>
							<PlaceCard place={place} className="h-full" />
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
