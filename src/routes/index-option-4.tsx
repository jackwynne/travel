/**
 * OPTION 4: "The Bento Dashboard"
 * --------------------------
 * Aesthetic: Modern bento-grid dashboard, Apple-inspired
 * Concept: Everything lives in a bento grid of rounded, softly-shadowed tiles.
 *          The hero image occupies the largest tile, stats/counts in smaller ones,
 *          the map in a wide tile, and places in a scrollable row tile. Feels like
 *          a personal travel dashboard. Soft gradients, frosted glass, and micro-
 *          interactions on every tile.
 *
 * Key design choices:
 *  - Google Font: "General Sans" (via CDN) / fallback "SF Pro Display" style
 *  - Color: Soft gradient meshes, frosted glass panels, vibrant but refined accents
 *  - Layout: Bento grid with varied tile sizes (2x2, 1x1, 3x1, etc.)
 *  - Motion: Hover lift on tiles, smooth gradient shifts, count animations
 *  - Unique: Stat tiles, gradient mesh backgrounds, frosted glass overlays
 */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { PlaceCard, PlaceCardSkeleton } from "@/components/PlaceCard";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
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
	Camera,
	Building2,
	Map as MapIcon,
	Compass,
	TrendingUp,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/index-option-4")({
	component: Home,
});

const sansFont = "'General Sans', -apple-system, 'SF Pro Display', system-ui, sans-serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://cdn.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap');

				.bento-tile {
					border-radius: 20px;
					transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
				}

				.bento-tile:hover {
					transform: translateY(-2px);
					box-shadow: 0 12px 40px rgba(0,0,0,0.08);
				}

				.dark .bento-tile:hover {
					box-shadow: 0 12px 40px rgba(0,0,0,0.3);
				}

				.mesh-gradient-1 {
					background:
						radial-gradient(at 30% 20%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
						radial-gradient(at 80% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
						radial-gradient(at 50% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
				}

				.dark .mesh-gradient-1 {
					background:
						radial-gradient(at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
						radial-gradient(at 80% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 50%),
						radial-gradient(at 50% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 70%);
				}

				.glass-panel {
					background: rgba(255, 255, 255, 0.6);
					backdrop-filter: blur(20px) saturate(180%);
					border: 1px solid rgba(255, 255, 255, 0.3);
				}

				.dark .glass-panel {
					background: rgba(30, 30, 30, 0.6);
					border: 1px solid rgba(255, 255, 255, 0.06);
				}

				.stat-number {
					background: linear-gradient(135deg, #3b82f6, #8b5cf6);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
				}

				.bento-fade {
					opacity: 0
					transform: translateY(16px) scale(0.98);
					animation: bentoFade 0.5s ease-out forwards;
				}

				@keyframes bentoFade {
					to { opacity: 1; transform: translateY(0) scale(1); }
				}
			`}</style>

			<div className="min-h-screen flex flex-col bg-background mesh-gradient-1" style={{ fontFamily: sansFont }}>
				{/* Dashboard Header */}
				<header className="sticky top-0 z-50 glass-panel">
					<div className="container mx-auto px-4 md:px-6">
						<div className="h-16 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-2.5 group">
								<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
									<Plane className="h-4 w-4 text-white -rotate-45" />
								</div>
								<span className="font-semibold text-lg tracking-tight">
									Travel
								</span>
							</Link>
							<ThemeToggle />
						</div>
					</div>
				</header>

				<main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8">
					<BentoDashboard />
				</main>

				{/* Footer */}
				<footer className="border-t border-border/30">
					<div className="container mx-auto px-4 md:px-6 py-6">
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Explore the world, one city at a time
							</p>
							<Link to="/admin">
								<Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
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

function BentoDashboard() {
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);
	const countriesWithCities = useQuery(api.functions.homepage.getCountriesWithCities);
	const recentPlaces = useQuery(api.functions.homepage.getRecentPlaces);
	const [selectedCountry, setSelectedCountry] = useState<Id<"country"> | null>(null);
	const [activeImage, setActiveImage] = useState(0);
	const navigate = useNavigate();

	useEffect(() => {
		if (!featuredImages || featuredImages.length <= 1) return;
		const interval = setInterval(() => {
			setActiveImage((i) => (i + 1) % featuredImages.length);
		}, 4000);
		return () => clearInterval(interval);
	}, [featuredImages]);

	const filteredCities =
		countriesWithCities?.flatMap((country) =>
			selectedCountry === null || selectedCountry === country._id
				? country.cities.map((city) => ({ ...city, countryId: country._id }))
				: [],
		) ?? [];

	const totalCities = countriesWithCities?.reduce((s, c) => s + c.cityCount, 0) ?? 0;
	const totalCountries = countriesWithCities?.length ?? 0;
	const totalPlaces = recentPlaces?.length ?? 0;
	const image = featuredImages?.[activeImage];

	return (
		<div className="grid grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 auto-rows-[140px]">
			{/* TILE: Hero Image - Large (spans 4 cols, 3 rows) */}
			<div className="bento-tile bento-fade col-span-4 row-span-3 relative overflow-hidden bg-muted border border-border/30">
				{featuredImages === undefined ? (
					<Skeleton className="h-full w-full" />
				) : featuredImages.length === 0 ? (
					<div className="h-full flex flex-col items-center justify-center text-center p-8">
						<Compass className="h-10 w-10 text-muted-foreground/30 mb-3" />
						<p className="text-muted-foreground text-sm">Mark images as featured to showcase them here</p>
					</div>
				) : (
					<>
						{featuredImages.map((img, i) => (
							<img
								key={img._id}
								src={img.url}
								alt={img.description ?? img.locationName}
								className={cn(
									"absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
									i === activeImage ? "opacity-100" : "opacity-0",
								)}
							/>
						))}
						<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
						<div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
							<div className="space-y-3">
								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/80 text-xs font-medium">
									<MapPin className="h-3 w-3" />
									{image?.imageType === "city" ? "Featured City" : "Featured Place"}
								</span>
								<h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
									{image?.locationName}
								</h2>
								{image?.description && (
									<p className="text-sm text-white/60 line-clamp-2 max-w-md">
										{image.description}
									</p>
								)}
								{image?.countryId && image?.cityId && (
									<Link
										to="/country/$countryId/city/$cityId"
										params={{ countryId: image.countryId, cityId: image.cityId }}
									>
										<Button size="sm" className="mt-2 gap-2 bg-white text-black hover:bg-white/90 rounded-full font-medium">
											Explore
											<ArrowRight className="h-3.5 w-3.5" />
										</Button>
									</Link>
								)}
							</div>

							{/* Dots */}
							<div className="flex gap-1.5 mt-4">
								{featuredImages.map((_, i) => (
									<button
										key={i}
										type="button"
										onClick={() => setActiveImage(i)}
										className={cn(
											"h-1.5 rounded-full transition-all",
											i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/30",
										)}
									/>
								))}
							</div>
						</div>
					</>
				)}
			</div>

			{/* TILE: Countries Stat */}
			<div className="bento-tile bento-fade col-span-2 lg:col-span-1 row-span-1 glass-panel p-5 flex flex-col justify-between" style={{ animationDelay: "0.1s" }}>
				<Globe className="h-5 w-5 text-blue-500" />
				<div>
					<div className="stat-number text-3xl font-bold">{totalCountries}</div>
					<p className="text-xs text-muted-foreground mt-0.5">Countries</p>
				</div>
			</div>

			{/* TILE: Cities Stat */}
			<div className="bento-tile bento-fade col-span-2 lg:col-span-1 row-span-1 glass-panel p-5 flex flex-col justify-between" style={{ animationDelay: "0.15s" }}>
				<Building2 className="h-5 w-5 text-violet-500" />
				<div>
					<div className="stat-number text-3xl font-bold">{totalCities}</div>
					<p className="text-xs text-muted-foreground mt-0.5">Cities</p>
				</div>
			</div>

			{/* TILE: Places Stat */}
			<div className="bento-tile bento-fade col-span-2 lg:col-span-1 row-span-1 glass-panel p-5 flex flex-col justify-between hidden lg:flex" style={{ animationDelay: "0.2s" }}>
				<Camera className="h-5 w-5 text-pink-500" />
				<div>
					<div className="stat-number text-3xl font-bold">{totalPlaces}</div>
					<p className="text-xs text-muted-foreground mt-0.5">Places</p>
				</div>
			</div>

			{/* TILE: Quick Countries List */}
			<div className="bento-tile bento-fade col-span-2 row-span-2 glass-panel p-5 overflow-hidden" style={{ animationDelay: "0.25s" }}>
				<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
					Countries
				</h3>
				<div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
					<button
						type="button"
						onClick={() => setSelectedCountry(null)}
						className={cn(
							"w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
							selectedCountry === null
								? "bg-primary text-primary-foreground"
								: "hover:bg-muted/80",
						)}
					>
						<span className="font-medium">All</span>
						<span className="text-xs opacity-60">{totalCities}</span>
					</button>
					{countriesWithCities?.map((country) => (
						<button
							key={country._id}
							type="button"
							onClick={() => setSelectedCountry(country._id)}
							className={cn(
								"w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
								selectedCountry === country._id
									? "bg-primary text-primary-foreground"
									: "hover:bg-muted/80",
							)}
						>
							<span className="font-medium">{country.name}</span>
							<span className="text-xs opacity-60">{country.cityCount}</span>
						</button>
					))}
				</div>
			</div>

			{/* TILE: Map - Wide */}
			<div className="bento-tile bento-fade col-span-4 row-span-3 overflow-hidden border border-border/30" style={{ animationDelay: "0.3s" }}>
				{countriesWithCities === undefined ? (
					<Skeleton className="h-full w-full" />
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
										params: { countryId: city.countryId, cityId: city._id },
									})
								}}
							>
								<MarkerContent>
									<div className="relative group cursor-pointer">
										<div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 border-2 border-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-125" />
										<div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
									</div>
								</MarkerContent>
								<MarkerTooltip>
									<span className="font-medium text-sm">{city.name}</span>
								</MarkerTooltip>
							</MapMarker>
						))}
					</Map>
				)}
			</div>

			{/* TILE: Recent Places - Full width carousel */}
			<div className="bento-tile bento-fade col-span-4 lg:col-span-6 row-span-2 glass-panel p-5 overflow-hidden" style={{ animationDelay: "0.4s" }}>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
						Recent Places
					</h3>
					<TrendingUp className="h-4 w-4 text-muted-foreground/50" />
				</div>

				{recentPlaces === undefined ? (
					<div className="flex gap-4 overflow-hidden">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="min-w-[200px]">
								<PlaceCardSkeleton />
							</div>
						))}
					</div>
				) : recentPlaces.length === 0 ? (
					<div className="h-full flex items-center justify-center text-muted-foreground text-sm">
						No places yet
					</div>
				) : (
					<div className="px-10">
						<Carousel
							opts={{ align: "start", loop: true }}
							plugins={[Autoplay({ delay: 5000 })]}
							className="w-full"
						>
							<CarouselContent className="-ml-3">
								{recentPlaces.map((place) => (
									<CarouselItem
										key={place._id}
										className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
									>
										<PlaceCard place={place} className="h-full" />
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious />
							<CarouselNext />
						</Carousel>
					</div>
				)}
			</div>
		</div>
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
