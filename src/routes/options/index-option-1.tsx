/**
 * OPTION 1: "The Editorial"
 * --------------------------
 * Aesthetic: High-fashion editorial / magazine cover layout
 * Concept: Treats travel photos like a luxury magazine spread. Large serif headings,
 *          asymmetric grid layouts, dramatic whitespace, and a muted warm palette
 *          with pops of terracotta accent. The hero uses a split layout with text
 *          on one side and a cropped image on the other. Sections feel like pages
 *          of a printed publication.
 *
 * Key design choices:
 *  - Google Font: "DM Serif Display" for headings, system sans for body
 *  - Color accent: terracotta/warm clay (#C2785C)
 *  - Layout: Asymmetric grids, generous padding, editorial feel
 *  - Motion: Subtle fade-ins on scroll, smooth hover lifts
 *  - Unique: Horizontal rule dividers, pull-quote style descriptions, issue-number styling
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
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
	Plane,
	ChevronRight,
	Settings,
	ArrowUpRight,
	Compass,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OptionsFloatingNav } from "@/components/OptionsFloatingNav";

export const Route = createFileRoute("/options/index-option-1")({
	component: Home,
});

/* ── Inline Styles for Editorial Fonts ── */
const editorialFont =
	"'DM Serif Display', 'Playfair Display', 'Georgia', serif";

function Home() {
	return (
		<>
			{/* Google Font Import */}
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');

				.editorial-heading {
					font-family: ${editorialFont};
					font-weight: 400;
					letter-spacing: -0.02em;
				}

				.editorial-accent {
					color: #C2785C
				}

				.editorial-rule {
					height: 1px
					background: linear-gradient(to right, transparent, currentColor 20%, currentColor 80%, transparent);
					opacity: 0.15
				}

				.fade-in-up {
					opacity: 0
					transform: translateY(24px);
					animation: fadeInUp 0.8s ease-out forwards;
				}

				@keyframes fadeInUp {
					to { opacity: 1; transform: translateY(0); }
				}

				.stagger-1 { animation-delay: 0.1s; }
				.stagger-2 { animation-delay: 0.2s; }
				.stagger-3 { animation-delay: 0.35s; }
				.stagger-4 { animation-delay: 0.5s; }
			`}</style>

			<div className="min-h-screen flex flex-col bg-background">
				{/* Editorial Header */}
				<header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-foreground/5">
					<div className="container mx-auto px-6 md:px-12">
						<div className="h-16 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-3 group">
								<span
									className="editorial-heading text-2xl tracking-tight"
									style={{ fontFamily: editorialFont }}
								>
									Travel
								</span>
								<span className="text-xs tracking-[0.3em] uppercase text-muted-foreground mt-1">
									Journal
								</span>
							</Link>
							<div className="flex items-center gap-4">
								<nav className="hidden md:flex items-center gap-8 text-sm tracking-wide text-muted-foreground">
									<a href="#destinations" className="hover:text-foreground transition-colors">
										Destinations
									</a>
									<a href="#recent" className="hover:text-foreground transition-colors">
										Recent
									</a>
								</nav>
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

				{/* Editorial Footer */}
				<footer className="border-t border-foreground/5">
					<div className="container mx-auto px-6 md:px-12 py-12">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
							<div>
								<span
									className="editorial-heading text-xl"
									style={{ fontFamily: editorialFont }}
								>
									Travel
								</span>
								<p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">
									A personal journal
								</p>
							</div>
							<div className="text-center text-sm text-muted-foreground">
								Explore the world, one city at a time
							</div>
							<div className="md:text-right">
								<Link to="/admin">
									<Button variant="outline" size="sm" className="gap-2 text-xs tracking-wide">
										<Settings className="h-3.5 w-3.5" />
										Admin Portal
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</footer>
				<OptionsFloatingNav currentKey="1" />
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
		return <HeroSkeleton />;
	}

	if (featuredImages.length === 0) {
		return <HeroEmpty />;
	}

	const image = featuredImages[activeIndex];

	return (
		<section className="relative">
			<div className="container mx-auto px-6 md:px-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[75vh] items-center">
					{/* Left: Editorial Text */}
					<div className="py-16 lg:py-24 lg:pr-16 space-y-8 fade-in-up">
						<div className="space-y-2">
							<div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-muted-foreground stagger-1 fade-in-up">
								<span className="w-8 h-px bg-current" />
								<span>{image.imageType === "city" ? "Featured City" : "Featured Place"}</span>
							</div>
							<h1
								className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] stagger-2 fade-in-up"
								style={{ fontFamily: editorialFont }}
							>
								{image.locationName}
							</h1>
						</div>

						{image.description && (
							<p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-md stagger-3 fade-in-up italic">
								"{image.description}"
							</p>
						)}

						{image.countryId && image.cityId && (
							<Link
								to="/country/$countryId/city/$cityId"
								params={{
									countryId: image.countryId,
									cityId: image.cityId,
								}}
								className="stagger-4 fade-in-up inline-block"
							>
								<Button
									variant="outline"
									size="lg"
									className="gap-3 rounded-none border-foreground/20 hover:bg-foreground hover:text-background transition-all text-sm tracking-wide"
								>
									Explore this destination
									<ArrowUpRight className="h-4 w-4" />
								</Button>
							</Link>
						)}

						{/* Slide indicator */}
						<div className="flex items-center gap-4 pt-4">
							<span className="text-xs text-muted-foreground tracking-wide">
								{String(activeIndex + 1).padStart(2, "0")} / {String(featuredImages.length).padStart(2, "0")}
							</span>
							<div className="flex gap-1.5">
								{featuredImages.map((_, i) => (
									<button
										key={i}
										type="button"
										onClick={() => setActiveIndex(i)}
										className={cn(
											"h-0.5 rounded-full transition-all duration-500",
											i === activeIndex
												? "w-8 bg-foreground"
												: "w-3 bg-foreground/20 hover:bg-foreground/40",
										)}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Right: Image */}
					<div className="relative h-[50vh] lg:h-[85vh] overflow-hidden">
						{featuredImages.map((img, i) => (
							<img
								key={img._id}
								src={img.url}
								alt={img.description ?? img.locationName}
								className={cn(
									"absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
									i === activeIndex ? "opacity-100" : "opacity-0",
								)}
							/>
						))}
						{/* Subtle editorial overlay */}
						<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/30 to-transparent" />
					</div>
				</div>
			</div>
			<div className="editorial-rule mx-12 text-foreground" />
		</section>
	)
}

function HeroSkeleton() {
	return (
		<section className="container mx-auto px-6 md:px-12">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[75vh] items-center">
				<div className="py-16 lg:py-24 lg:pr-16 space-y-8">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-20 w-96" />
					<Skeleton className="h-6 w-72" />
					<Skeleton className="h-12 w-48" />
				</div>
				<Skeleton className="h-[50vh] lg:h-[85vh]" />
			</div>
		</section>
	)
}

function HeroEmpty() {
	return (
		<section className="container mx-auto px-6 md:px-12 py-32 text-center">
			<Compass className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
			<h2
				className="text-4xl mb-4"
				style={{ fontFamily: editorialFont }}
			>
				Welcome to Travel
			</h2>
			<p className="text-muted-foreground max-w-md mx-auto">
				Mark images as featured in the admin panel to showcase them here.
			</p>
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
		return <MapSkeleton />;
	}

	return (
		<section id="destinations" className="py-20">
			<div className="container mx-auto px-6 md:px-12">
				{/* Editorial section header */}
				<div className="flex items-end justify-between mb-12">
					<div>
						<span className="text-xs tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3 mb-3">
							<span className="w-8 h-px bg-current" />
							Destinations
						</span>
						<h2
							className="text-4xl md:text-5xl"
							style={{ fontFamily: editorialFont }}
						>
							Where we've been
						</h2>
					</div>
					<p className="hidden md:block text-sm text-muted-foreground max-w-xs text-right">
						Select a country to explore its cities on the map
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Country sidebar */}
					<div className="lg:col-span-1 space-y-1">
						<button
							type="button"
							onClick={() => setSelectedCountry(null)}
							className={cn(
								"w-full flex items-center justify-between px-4 py-3 text-left transition-all border-l-2",
								selectedCountry === null
									? "border-l-foreground bg-foreground/5 text-foreground"
									: "border-l-transparent text-muted-foreground hover:text-foreground hover:border-l-foreground/30",
							)}
						>
							<span className="text-sm tracking-wide">All Countries</span>
							<span className="text-xs text-muted-foreground">
								{countriesWithCities.reduce((sum, c) => sum + c.cityCount, 0)}
							</span>
						</button>

						{countriesWithCities.map((country) => (
							<button
								key={country._id}
								type="button"
								onClick={() => setSelectedCountry(country._id)}
								className={cn(
									"w-full flex items-center justify-between px-4 py-3 text-left transition-all border-l-2",
									selectedCountry === country._id
										? "border-l-foreground bg-foreground/5 text-foreground"
										: "border-l-transparent text-muted-foreground hover:text-foreground hover:border-l-foreground/30",
								)}
							>
								<span className="text-sm tracking-wide">{country.name}</span>
								<span className="text-xs">{country.cityCount}</span>
							</button>
						))}
					</div>

					{/* Map */}
					<div className="lg:col-span-3">
						<div className="h-[500px] overflow-hidden border border-foreground/10">
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
												<div className="h-3 w-3 rounded-full bg-foreground border-2 border-background shadow-lg transition-transform group-hover:scale-150" />
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

function MapSkeleton() {
	return (
		<section className="py-20">
			<div className="container mx-auto px-6 md:px-12">
				<Skeleton className="h-10 w-64 mb-12" />
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					<Skeleton className="h-[400px]" />
					<div className="lg:col-span-3">
						<Skeleton className="h-[500px]" />
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
		return <PlacesSkeleton />;
	}

	if (recentPlaces.length === 0) {
		return null;
	}

	return (
		<section id="recent" className="py-20 border-t border-foreground/5">
			<div className="container mx-auto px-6 md:px-12">
				<div className="flex items-end justify-between mb-12">
					<div>
						<span className="text-xs tracking-[0.3em] uppercase text-muted-foreground flex items-center gap-3 mb-3">
							<span className="w-8 h-px bg-current" />
							Recently Added
						</span>
						<h2
							className="text-4xl md:text-5xl"
							style={{ fontFamily: editorialFont }}
						>
							Latest discoveries
						</h2>
					</div>
				</div>

				{/* Editorial grid - asymmetric */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{recentPlaces.slice(0, 12).map((place, i) => (
						<div
							key={place._id}
							className="fade-in-up"
							style={{ animationDelay: `${i * 0.05}s` }}
						>
							<PlaceCard place={place} className="h-full" />
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

function PlacesSkeleton() {
	return (
		<section className="py-20 border-t border-foreground/5">
			<div className="container mx-auto px-6 md:px-12">
				<Skeleton className="h-10 w-64 mb-12" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<PlaceCardSkeleton key={i} />
					))}
				</div>
			</div>
		</section>
	)
}
