/**
 * OPTION 3: "The Travel Journal"
 * --------------------------
 * Aesthetic: Warm, analog, scrapbook / journal feel
 * Concept: Feels like opening a beautifully kept travel journal. Warm cream
 *          backgrounds, handwritten-style accent font, polaroid-style photo frames,
 *          subtle paper texture, stamp/postmark decorative elements. The hero shows
 *          photos in a scattered polaroid stack. Map section has a vintage cartography feel.
 *          Places are displayed as postcard-style cards.
 *
 * Key design choices:
 *  - Google Font: "Caveat" for accent/handwritten, "Libre Baskerville" for body
 *  - Color: Warm cream (#FFFBF5), deep brown (#3D2B1F), burnt sienna accent (#A0522D)
 *  - Layout: Organic, slightly rotated elements, polaroid frames
 *  - Motion: Gentle tilts on hover, stamp-press animations
 *  - Unique: Paper texture overlay, washi-tape style decorations, postmark stamps
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
	BookOpen,
	Stamp,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/index-option-3")({
	component: Home,
});

const handwrittenFont = "'Caveat', cursive";
const serifFont = "'Libre Baskerville', 'Georgia', serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

				.journal-bg {
					background-color: #FFFBF5;
					color: #3D2B1F
				}

				.dark .journal-bg {
					background-color: #1a1612;
					color: #e8ddd0
				}

				.paper-texture {
					background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23FFFBF5' surfaceScale='1'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
					background-size: 200px 200px;
				}

				.polaroid {
					background: white;
					padding: 12px 12px 48px 12px;
					box-shadow: 0 4px 20px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
					transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
				}

				.dark .polaroid {
					background: #2a2420;
					box-shadow: 0 4px 20px rgba(0,0,0,0.3);
				}

				.polaroid:hover {
					transform: rotate(0deg) scale(1.02) !important;
					z-index: 10
				}

				.washi-tape {
					background: repeating-linear-gradient(
						45deg,
						transparent,
						transparent 3px,
						rgba(160, 82, 45, 0.08) 3px,
						rgba(160, 82, 45, 0.08) 6px
					)
					background-color: rgba(160, 82, 45, 0.15);
				}

				.dark .washi-tape {
					background-color: rgba(160, 82, 45, 0.25);
				}

				.postmark {
					border: 2px solid rgba(160, 82, 45, 0.25);
					border-radius: 50%;
					padding: 8px 16px;
					transform: rotate(-12deg);
				}

				.journal-fade {
					opacity: 0
					transform: translateY(20px) rotate(-1deg);
					animation: journalFade 0.6s ease-out forwards;
				}

				@keyframes journalFade {
					to { opacity: 1; transform: translateY(0) rotate(0deg); }
				}

				.ruled-lines {
					background-image: repeating-linear-gradient(
						transparent,
						transparent 31px,
						rgba(160, 82, 45, 0.08) 31px,
						rgba(160, 82, 45, 0.08) 32px
					)
				}
			`}</style>

			<div className="min-h-screen flex flex-col journal-bg">
				{/* Journal Header */}
				<header className="sticky top-0 z-50 journal-bg border-b border-[#3D2B1F]/10 dark:border-white/5 backdrop-blur-sm bg-[#FFFBF5]/90 dark:bg-[#1a1612]/90">
					<div className="container mx-auto px-6 md:px-10">
						<div className="h-16 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-3 group">
								<BookOpen className="h-5 w-5 text-[#A0522D]" />
								<div className="flex items-baseline gap-2">
									<span
										className="text-2xl text-[#3D2B1F] dark:text-[#e8ddd0]"
										style={{ fontFamily: handwrittenFont }}
									>
										My Travel Journal
									</span>
								</div>
							</Link>
							<ThemeToggle />
						</div>
					</div>
				</header>

				<main className="flex-1">
					<HeroSection />
					<MapSection />
					<PlacesSection />
				</main>

				{/* Journal Footer */}
				<footer className="border-t border-[#3D2B1F]/10 dark:border-white/5">
					<div className="container mx-auto px-6 md:px-10 py-10">
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							<p
								className="text-lg text-[#A0522D]/70"
								style={{ fontFamily: handwrittenFont }}
							>
								"Not all those who wander are lost"
							</p>
							<Link to="/admin">
								<Button
									variant="outline"
									size="sm"
									className="gap-2 border-[#3D2B1F]/15 dark:border-white/10 text-[#3D2B1F]/60 dark:text-white/40 hover:text-[#3D2B1F] dark:hover:text-white bg-transparent"
								>
									<Settings className="h-3.5 w-3.5" />
									Admin Portal
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
			<section className="py-20">
				<div className="container mx-auto px-6 md:px-10">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
						<Skeleton className="h-80 bg-[#3D2B1F]/5" />
						<div className="space-y-4">
							<Skeleton className="h-12 w-64 bg-[#3D2B1F]/5" />
							<Skeleton className="h-6 w-48 bg-[#3D2B1F]/5" />
						</div>
					</div>
				</div>
			</section>
		)
	}

	if (featuredImages.length === 0) {
		return (
			<section className="py-32 text-center ruled-lines">
				<div className="container mx-auto px-6">
					<Plane className="h-10 w-10 text-[#A0522D]/30 mx-auto mb-6" />
					<h2
						className="text-4xl text-[#3D2B1F] dark:text-[#e8ddd0] mb-3"
						style={{ fontFamily: handwrittenFont }}
					>
						A new chapter begins...
					</h2>
					<p style={{ fontFamily: serifFont }} className="text-[#3D2B1F]/50 dark:text-white/40 text-sm">
						Mark images as featured in the admin panel to fill these pages.
					</p>
				</div>
			</section>
		)
	}

	const image = featuredImages[activeIndex];
	const rotations = [-3, 2, -1.5, 3, -2];

	return (
		<section className="py-16 md:py-24 overflow-hidden">
			<div className="container mx-auto px-6 md:px-10">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[60vh]">
					{/* Polaroid Stack */}
					<div className="relative h-[400px] md:h-[500px] journal-fade">
						{featuredImages.slice(0, 3).map((img, i) => {
							const isActive = i === activeIndex % Math.min(3, featuredImages.length);
							return (
								<div
									key={img._id}
									className={cn(
										"polaroid absolute cursor-pointer",
										isActive ? "z-10" : "z-0",
									)}
									style={{
										transform: `rotate(${rotations[i]}deg)`,
										top: "${i * 10 + 10}px",
										left: "${i * 15 + 5}%",
										width: "75%",
										maxWidth: "380px",
									}}
									onClick={() => setActiveIndex(i)}
								>
									<img
										src={img.url}
										alt={img.description ?? img.locationName}
										className="w-full h-[280px] md:h-[340px] object-cover"
									/>
									<p
										className="mt-2 text-center text-lg text-[#3D2B1F] dark:text-[#e8ddd0]"
										style={{ fontFamily: handwrittenFont }}
									>
										{img.locationName}
									</p>
								</div>
							)
						})}
					</div>

					{/* Journal Text */}
					<div className="space-y-6 ruled-lines py-8 px-4">
						{/* Decorative postmark */}
						<div className="postmark inline-block mb-4">
							<span className="text-xs tracking-[0.2em] uppercase text-[#A0522D]/50">
								Featured
							</span>
						</div>

						<h1
							className="text-5xl md:text-7xl text-[#3D2B1F] dark:text-[#e8ddd0] leading-tight journal-fade"
							style={{ fontFamily: handwrittenFont }}
						>
							{image.locationName}
						</h1>

						{image.description && (
							<p
								className="text-base text-[#3D2B1F]/60 dark:text-white/50 leading-relaxed max-w-md journal-fade"
								style={{
									fontFamily: serifFont,
									fontStyle: "italic",
									animationDelay: "0.2s",
								}}
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
								className="journal-fade inline-block"
								style={{ animationDelay: "0.3s" }}
							>
								<Button
									variant="outline"
									className="gap-2 border-[#A0522D]/30 text-[#A0522D] hover:bg-[#A0522D]/10 hover:text-[#A0522D] bg-transparent rounded-sm"
								>
									Read this entry
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
						)}

						{/* Slide dots */}
						<div className="flex gap-3 pt-4">
							{featuredImages.map((_, i) => (
								<button
									key={i}
									type="button"
									onClick={() => setActiveIndex(i)}
									className={cn(
										"h-2 w-2 rounded-full transition-all",
										i === activeIndex
											? "bg-[#A0522D] scale-125"
											: "bg-[#A0522D]/20 hover:bg-[#A0522D]/40",
									)}
								/>
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
			<section className="py-20">
				<div className="container mx-auto px-6 md:px-10">
					<Skeleton className="h-[500px] bg-[#3D2B1F]/5" />
				</div>
			</section>
		)
	}

	return (
		<section className="py-20 border-t border-[#3D2B1F]/5 dark:border-white/5">
			<div className="container mx-auto px-6 md:px-10">
				{/* Washi tape header decoration */}
				<div className="relative mb-12">
					<div className="washi-tape absolute -top-3 left-8 w-24 h-6 -rotate-2 rounded-sm" />
					<h2
						className="text-4xl md:text-5xl text-[#3D2B1F] dark:text-[#e8ddd0] pt-4"
						style={{ fontFamily: handwrittenFont }}
					>
						Places I've Visited
					</h2>
					<p
						className="text-sm text-[#3D2B1F]/40 dark:text-white/30 mt-2"
						style={{ fontFamily: serifFont, fontStyle: "italic" }}
					>
						Tap a country to see its cities
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Country pills */}
					<div className="lg:col-span-1 flex flex-wrap lg:flex-col gap-2">
						<button
							type="button"
							onClick={() => setSelectedCountry(null)}
							className={cn(
								"px-4 py-2 text-sm rounded-full transition-all",
								selectedCountry === null
									? "bg-[#A0522D] text-white"
									: "bg-[#3D2B1F]/5 dark:bg-white/5 text-[#3D2B1F]/60 dark:text-white/40 hover:bg-[#3D2B1F]/10 dark:hover:bg-white/10",
							)}
							style={{ fontFamily: serifFont }}
						>
							All ({countriesWithCities.reduce((s, c) => s + c.cityCount, 0)})
						</button>
						{countriesWithCities.map((country) => (
							<button
								key={country._id}
								type="button"
								onClick={() => setSelectedCountry(country._id)}
								className={cn(
									"px-4 py-2 text-sm rounded-full transition-all",
									selectedCountry === country._id
										? "bg-[#A0522D] text-white"
										: "bg-[#3D2B1F]/5 dark:bg-white/5 text-[#3D2B1F]/60 dark:text-white/40 hover:bg-[#3D2B1F]/10 dark:hover:bg-white/10",
								)}
								style={{ fontFamily: serifFont }}
							>
								{country.name} ({country.cityCount})
							</button>
						))}
					</div>

					{/* Map */}
					<div className="lg:col-span-3">
						<div className="h-[500px] rounded-lg overflow-hidden border border-[#3D2B1F]/10 dark:border-white/5 shadow-sm">
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
												<div className="h-4 w-4 rounded-full bg-[#A0522D] border-2 border-[#FFFBF5] dark:border-[#1a1612] shadow-lg transition-transform group-hover:scale-125" />
											</div>
										</MarkerContent>
										<MarkerTooltip>
											<span
												className="text-sm"
												style={{ fontFamily: handwrittenFont }}
											>
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
				<div className="container mx-auto px-6 md:px-10">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
		<section className="py-20 border-t border-[#3D2B1F]/5 dark:border-white/5">
			<div className="container mx-auto px-6 md:px-10">
				<div className="relative mb-12">
					<div className="washi-tape absolute -top-3 left-12 w-20 h-6 rotate-1 rounded-sm" />
					<h2
						className="text-4xl md:text-5xl text-[#3D2B1F] dark:text-[#e8ddd0] pt-4"
						style={{ fontFamily: handwrittenFont }}
					>
						Recent Entries
					</h2>
					<p
						className="text-sm text-[#3D2B1F]/40 dark:text-white/30 mt-2"
						style={{ fontFamily: serifFont, fontStyle: "italic" }}
					>
						The latest pages in our journal
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{recentPlaces.slice(0, 12).map((place, i) => (
						<div
							key={place._id}
							className="journal-fade"
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
