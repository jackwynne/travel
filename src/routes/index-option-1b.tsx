/**
 * OPTION 1B: "The Editorial — Refined"
 * --------------------------
 * Refinement of Option 1. Key changes:
 *  - Hero is now full-width image with editorial text overlaid (instead of split layout),
 *    giving it more visual punch while keeping the serif/magazine feel
 *  - Added a thin "issue bar" running across the top of the hero with metadata
 *  - Section headers use a more pronounced vertical accent line instead of horizontal dash
 *  - Country sidebar uses a cleaner tabular layout with hover underlines
 *  - Places section uses a masonry-inspired staggered grid (alternating tall/short cards)
 *  - Warmer overall palette — added a cream tint to backgrounds
 *  - Footer has a more elegant horizontal rule treatment
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
	Plane,
	ChevronRight,
	Settings,
	ArrowUpRight,
	Compass,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/index-option-1b")({
	component: Home,
});

const editorialFont =
	"'DM Serif Display', 'Playfair Display', 'Georgia', serif";
const bodyFont = "'Instrument Sans', 'Inter Variable', sans-serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap');

				.ed-heading {
					font-family: ${editorialFont};
					font-weight: 400;
					letter-spacing: -0.025em;
				}

				.ed-body {
					font-family: ${bodyFont};
				}

				.ed-warm-bg {
					background-color: oklch(0.99 0.005 80);
				}

				.dark .ed-warm-bg {
					background-color: oklch(0.16 0.005 80);
				}

				.ed-fade {
					opacity: 0;
					transform: translateY(20px);
					animation: edFade 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
				}

				@keyframes edFade {
					to { opacity: 1; transform: translateY(0); }
				}

				.ed-line-reveal {
					width: 0;
					animation: lineReveal 0.8s ease-out 0.3s forwards;
				}

				@keyframes lineReveal {
					to { width: 100%; }
				}

				.ed-hover-line {
					position: relative;
				}

				.ed-hover-line::after {
					content: '';
					position: absolute;
					bottom: -2px;
					left: 0;
					width: 0;
					height: 1px;
					background: currentColor;
					transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
				}

				.ed-hover-line:hover::after {
					width: 100%;
				}
			`}</style>

			<div className="min-h-screen flex flex-col bg-background ed-warm-bg" style={{ fontFamily: bodyFont }}>
				{/* Header */}
				<header className="sticky top-0 z-50 ed-warm-bg backdrop-blur-md bg-opacity-95">
					<div className="container mx-auto px-6 md:px-12">
						<div className="h-14 flex items-center justify-between border-b border-foreground/8">
							<Link to="/" className="flex items-baseline gap-2.5 group">
								<span className="ed-heading text-xl">Travel</span>
								<span className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground font-medium">
									Journal
								</span>
							</Link>
							<div className="flex items-center gap-6">
								<nav className="hidden md:flex items-center gap-8">
									<a href="#destinations" className="ed-hover-line text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
										Destinations
									</a>
									<a href="#recent" className="ed-hover-line text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors">
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

				{/* Footer */}
				<footer>
					<div className="container mx-auto px-6 md:px-12">
						<div className="h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
						<div className="py-10 flex flex-col md:flex-row items-center justify-between gap-6">
							<div className="flex items-baseline gap-2.5">
								<span className="ed-heading text-lg">Travel</span>
								<span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
									A personal journal
								</span>
							</div>
							<p className="text-xs text-muted-foreground tracking-wide">
								Explore the world, one city at a time
							</p>
							<Link to="/admin">
								<Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground tracking-wide">
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
			<section className="relative h-[80vh] min-h-[500px] bg-muted/30">
				<div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
					<Skeleton className="h-4 w-32 mb-4" />
					<Skeleton className="h-16 w-[60%] mb-3" />
					<Skeleton className="h-5 w-64" />
				</div>
			</section>
		)
	}

	if (featuredImages.length === 0) {
		return (
			<section className="py-32 text-center">
				<Compass className="h-10 w-10 text-muted-foreground/20 mx-auto mb-6" />
				<h2 className="ed-heading text-3xl mb-3">Welcome to Travel</h2>
				<p className="text-sm text-muted-foreground">
					Mark images as featured in the admin panel to showcase them here.
				</p>
			</section>
		)
	}

	const image = featuredImages[activeIndex];

	return (
		<section className="relative h-[80vh] min-h-[550px] overflow-hidden">
			{/* Full-width images */}
			{featuredImages.map((img, i) => (
				<img
					key={img._id}
					src={img.url}
					alt={img.description ?? img.locationName}
					className={cn(
						"absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms]",
						i === activeIndex ? "opacity-100" : "opacity-0",
					)}
				/>
			))}

			{/* Editorial overlay — dark gradient from bottom and left */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
			<div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

			{/* Issue bar at top */}
			<div className="absolute top-0 left-0 right-0 z-10">
				<div className="container mx-auto px-6 md:px-12">
					<div className="flex items-center justify-between py-4 border-b border-white/10">
						<span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
							{image.imageType === "city" ? "Featured City" : "Featured Place"}
						</span>
						<span className="text-[10px] tracking-[0.2em] text-white/30">
							{String(activeIndex + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(featuredImages.length).padStart(2, "0")}
						</span>
					</div>
				</div>
			</div>

			{/* Content at bottom */}
			<div className="absolute inset-0 flex flex-col justify-end">
				<div className="container mx-auto px-6 md:px-12 pb-12 md:pb-16">
					<div className="max-w-3xl space-y-5 ed-fade">
						{/* Vertical accent line + label */}
						<div className="flex items-center gap-3">
							<div className="w-px h-6 bg-white/40" />
							<MapPin className="h-3.5 w-3.5 text-white/50" />
							<span className="text-xs tracking-[0.2em] uppercase text-white/50">
								{image.imageType === "city" ? "City" : "Place"}
							</span>
						</div>

						<h1
							className="text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9] ed-fade"
							style={{ fontFamily: editorialFont, animationDelay: "0.15s" }}
						>
							{image.locationName}
						</h1>

						{image.description && (
							<p
								className="text-base md:text-lg text-white/60 leading-relaxed max-w-lg ed-fade italic"
								style={{ animationDelay: "0.3s" }}
							>
								"{image.description}"
							</p>
						)}

						<div className="flex items-center gap-6 ed-fade" style={{ animationDelay: "0.4s" }}>
							{image.countryId && image.cityId && (
								<Link
									to="/country/$countryId/city/$cityId"
									params={{
										countryId: image.countryId,
										cityId: image.cityId,
									}}
								>
									<Button
										variant="outline"
										size="lg"
										className="gap-3 rounded-none border-white/25 text-white hover:bg-white hover:text-black transition-all text-sm tracking-wide bg-transparent"
									>
										Explore this destination
										<ArrowUpRight className="h-4 w-4" />
									</Button>
								</Link>
							)}
						</div>
					</div>

					{/* Slide indicators */}
					<div className="flex gap-2 mt-8">
						{featuredImages.map((_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setActiveIndex(i)}
								className={cn(
									"h-px rounded-full transition-all duration-700",
									i === activeIndex
										? "w-12 bg-white"
										: "w-6 bg-white/25 hover:bg-white/40",
								)}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

function SectionHeader({
	label,
	title,
	rightContent,
}: {
	label: string;
	title: string;
	rightContent?: React.ReactNode;
}) {
	return (
		<div className="flex items-end justify-between mb-12">
			<div className="flex items-start gap-4">
				<div className="w-px h-12 bg-foreground/20 mt-1 shrink-0" />
				<div>
					<span className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground block mb-2">
						{label}
					</span>
					<h2 className="ed-heading text-3xl md:text-5xl">{title}</h2>
				</div>
			</div>
			{rightContent && (
				<div className="hidden md:block text-sm text-muted-foreground max-w-xs text-right">
					{rightContent}
				</div>
			)}
		</div>
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
			<section className="py-20">
				<div className="container mx-auto px-6 md:px-12">
					<Skeleton className="h-10 w-64 mb-12" />
					<Skeleton className="h-[500px]" />
				</div>
			</section>
		)
	}

	return (
		<section id="destinations" className="py-20">
			<div className="container mx-auto px-6 md:px-12">
				<SectionHeader
					label="Destinations"
					title="Where we've been"
					rightContent="Select a country to explore its cities on the map"
				/>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Country list — tabular with hover underlines */}
					<div className="lg:col-span-1">
						<div className="space-y-0">
							<button
								type="button"
								onClick={() => setSelectedCountry(null)}
								className={cn(
									"w-full flex items-center justify-between py-3 text-left transition-all group",
									selectedCountry === null
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<span className={cn(
									"text-sm tracking-wide ed-hover-line",
									selectedCountry === null && "font-medium",
								)}>
									All Countries
								</span>
								<span className="text-xs tabular-nums opacity-50">
									{countriesWithCities.reduce((sum, c) => sum + c.cityCount, 0)}
								</span>
							</button>
							<div className="h-px bg-foreground/5" />

							{countriesWithCities.map((country) => (
								<div key={country._id}>
									<button
										type="button"
										onClick={() => setSelectedCountry(country._id)}
										className={cn(
											"w-full flex items-center justify-between py-3 text-left transition-all group",
											selectedCountry === country._id
												? "text-foreground"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										<span className={cn(
											"text-sm tracking-wide ed-hover-line",
											selectedCountry === country._id && "font-medium",
										)}>
											{country.name}
										</span>
										<span className="text-xs tabular-nums opacity-50">
											{country.cityCount}
										</span>
									</button>
									<div className="h-px bg-foreground/5" />
								</div>
							))}
						</div>
					</div>

					{/* Map */}
					<div className="lg:col-span-3">
						<div className="h-[500px] overflow-hidden">
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
												<div className="h-2.5 w-2.5 rounded-full bg-foreground border-[1.5px] border-background shadow-lg transition-transform group-hover:scale-[1.8]" />
											</div>
										</MarkerContent>
										<MarkerTooltip>
											<span className="text-sm" style={{ fontFamily: editorialFont }}>
												{city.name}
											</span>
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
			<section className="py-20">
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

	if (recentPlaces.length === 0) return null;

	return (
		<section id="recent" className="py-20">
			<div className="container mx-auto px-6 md:px-12">
				{/* Elegant divider */}
				<div className="h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent mb-20" />

				<SectionHeader label="Recently Added" title="Latest discoveries" />

				{/* Staggered grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
					{recentPlaces.slice(0, 12).map((place, i) => (
						<div
							key={place._id}
							className={cn(
								"ed-fade",
								i % 3 === 1 && "lg:mt-8",
							)}
							style={{ animationDelay: `${i * 0.06}s` }}
						>
							<PlaceCard place={place} className="h-full" />
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
