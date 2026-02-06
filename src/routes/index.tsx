/**
 * OPTION 5B: "The Brutalist Typographer — Refined"
 * --------------------------
 * Refinement of Option 5. Key changes:
 *  - Replaced the #BFFF00 lime with a deep electric orange (#FF5D00) for more warmth
 *    and readability, especially in light mode
 *  - Hero now uses a horizontal split: image fills the right 60%, massive type on the left
 *    with a stark white/black background — more brutalist than the image-overlay approach
 *  - Added a horizontal ticker/crawl at the very top with coordinates and metadata
 *  - Map markers are now crosshair/plus shapes instead of rotated squares
 *  - Places section uses a numbered list layout — each card has a large index number,
 *    giving it a catalog/index feel
 *  - Tightened spacing throughout, denser information hierarchy
 *  - Country filter now displayed as horizontal row of buttons above the map
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
	Globe,
	MapPin,
	ChevronRight,
	Settings,
	ArrowUpRight,
	Plane,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
	component: Home,
});

const monoFont = "'Space Mono', 'Courier New', monospace";
const displayFont = "'Instrument Serif', 'Georgia', serif";

function Home() {
	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap');

				.b-accent { color: #FF5D00; }
				.b-bg-accent { background-color: #FF5D00; color: #fff; }

				.b-heading {
					font-family: ${displayFont};
					line-height: 0.85;
					letter-spacing: -0.03em;
				}

				.b-mono {
					font-family: ${monoFont};
				}

				.b-slide {
					opacity: 0
					transform: translateX(-30px);
					animation: bSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}

				@keyframes bSlide {
					to { opacity: 1; transform: translateX(0); }
				}

				.b-crawl {
					animation: crawl 40s linear infinite;
				}

				@keyframes crawl {
					from { transform: translateX(0); }
					to { transform: translateX(-50%); }
				}

				.b-crosshair {
					position: relative;
					width: 14px
					height: 14px
				}

				.b-crosshair::before,
				.b-crosshair::after {
					content: ""
					position: absolute;
					background: #FF5D00;
				}

				.b-crosshair::before {
					width: 2px
					height: 100%
					left: 50%
					transform: translateX(-50%);
				}

				.b-crosshair::after {
					width: 100%
					height: 2px
					top: 50%
					transform: translateY(-50%);
				}

				.b-crosshair-active::before,
				.b-crosshair-active::after {
					background: #fff;
					box-shadow: 0 0 0 3px #FF5D00;
				}

				.b-grid-bg {
					background-image:
						linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px),
						linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px);
					background-size: 24px 24px;
				}

				.b-stamp {
					border: 2px dashed currentColor;
					border-radius: 6px;
					box-shadow: inset 0 0 0 2px rgba(255,93,0,0.2);
				}

				.b-filmstrip {
					background: linear-gradient(90deg, rgba(0,0,0,0.04) 12px, transparent 12px, transparent calc(100% - 12px), rgba(0,0,0,0.04) calc(100% - 12px));
					border-top: 2px solid currentColor;
					border-bottom: 2px solid currentColor;
				}

				.b-film-hole {
					width: 10px
					height: 10px
					border-radius: 2px;
					background: currentColor;
					opacity: 0.2
				}

				.b-photo-frame {
					box-shadow: 0 12px 40px rgba(0,0,0,0.12);
					border: 10px solid #fff;
				}

				.b-darkroom {
					background: radial-gradient(circle at 20% 20%, rgba(255,93,0,0.12), transparent 45%),
						linear-gradient(180deg, #0f0f0f 0%, #111 60%, #0a0a0a 100%);
				}

				.b-tape {
					background: repeating-linear-gradient(135deg, rgba(255,93,0,0.2) 0 8px, rgba(255,255,255,0.2) 8px 16px);
				}
			`}</style>

			<div className="min-h-screen flex flex-col bg-background text-foreground">
				{/* Crawl ticker */}
				<div className="border-b-2 border-foreground overflow-hidden h-7 flex items-center bg-foreground text-background">
					<div className="b-crawl flex whitespace-nowrap">
						{[...Array(3)].map((_, i) => (
							<span
								key={i}
								className="text-[10px] tracking-[0.2em] uppercase px-8"
								style={{ fontFamily: monoFont }}
							>
								Travel Log &bull; Personal Archive &bull; Cities &bull; Places &bull; Routes &bull; Photography &bull;&nbsp;
							</span>
						))}
					</div>
				</div>

				{/* Header */}
				<header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
					<div className="px-4 md:px-8">
						<div className="h-12 flex items-center justify-between">
							<Link to="/" className="flex items-center gap-3 group">
								<span
									className="text-sm font-bold tracking-[0.4em] uppercase"
									style={{ fontFamily: monoFont }}
								>
									TRAVEL
								</span>
								<span className="text-lg" style={{ color: "#FF5D00" }}><Plane /></span>
							</Link>
							<div className="flex items-center gap-4">
								<span
									className="hidden md:inline text-[10px] text-muted-foreground tracking-[0.15em]"
									style={{ fontFamily: monoFont }}
								>
									[travel.jackwynne.nz]
								</span>
								<ThemeToggle />
							</div>
						</div>
					</div>
				</header>

				<main className="flex-1">
					<HeroSection />
					<MapSection />
					<CountryShowcaseSection />
					<PlacesSection />
					<PhotoShowcaseSection />
				</main>

				{/* Footer */}
				<footer className="border-t-2 border-foreground">
					<div className="px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<span
							className="text-[10px] text-muted-foreground tracking-[0.1em]"
							style={{ fontFamily: monoFont }}
						>
							// explore the world, one city at a time
						</span>
						<Link to="/admin">
							<Button
								variant="outline"
								size="sm"
								className="gap-2 rounded-none border-2 border-foreground text-foreground text-[10px] tracking-[0.15em] uppercase hover:bg-[#FF5D00] hover:text-white hover:border-[#FF5D00]"
								style={{ fontFamily: monoFont }}
							>
								<Settings className="h-3 w-3" />
								Admin
							</Button>
						</Link>
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
			<section className="h-[75vh] flex items-center justify-center border-b-2 border-foreground">
				<span
					className="text-sm text-muted-foreground animate-pulse"
					style={{ fontFamily: monoFont }}
				>
					loading_
				</span>
			</section>
		)
	}

	if (featuredImages.length === 0) {
		return (
			<section className="py-32 px-4 md:px-8 border-b-2 border-foreground text-center">
				<h2 className="b-heading text-6xl md:text-8xl text-muted-foreground/20 uppercase">
					Empty
				</h2>
				<p
					className="text-[11px] text-muted-foreground mt-4"
					style={{ fontFamily: monoFont }}
				>
					// mark images as featured to populate
				</p>
			</section>
		)
	}

	const image = featuredImages[activeIndex];

	return (
		<section className="border-b-2 border-foreground">
			<div className="grid grid-cols-1 lg:grid-cols-5 min-h-[75vh]">
				{/* Left: Typography */}
				<div className="lg:col-span-2 flex flex-col justify-between p-6 md:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground">
					{/* Top metadata */}
					<div className="flex items-center justify-between">
						<span
							className="text-[10px] text-muted-foreground tracking-[0.15em]"
							style={{ fontFamily: monoFont }}
						>
							{String(activeIndex + 1).padStart(2, "0")}/{String(featuredImages.length).padStart(2, "0")}
						</span>
						<span
							className="text-[10px] tracking-[0.15em] uppercase"
							style={{ fontFamily: monoFont, color: "#FF5D00" }}
						>
							[Featured]
						</span>
					</div>

					{/* Title */}
					<div className="py-8 b-slide">
						<h1 className="b-heading text-5xl md:text-7xl xl:text-8xl uppercase mb-6">
							{image.locationName}
						</h1>

						{image.description && (
							<p
								className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-6"
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
								className="inline-flex items-center gap-2 hover:gap-3 transition-all group"
								style={{ fontFamily: monoFont, color: "#FF5D00" }}
							>
								<span className="text-xs font-bold uppercase tracking-[0.1em]">Explore</span>
								<ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</Link>
						)}
					</div>

					{/* Slide selectors */}
					<div className="flex gap-2">
						{featuredImages.map((_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setActiveIndex(i)}
								className={cn(
									"w-7 h-7 border-2 text-[10px] transition-all",
									i === activeIndex
										? "border-[#FF5D00] text-[#FF5D00] bg-[#FF5D00]/5"
										: "border-foreground/15 text-muted-foreground hover:border-foreground/40",
								)}
								style={{ fontFamily: monoFont }}
							>
								{String(i + 1).padStart(2, "0")}
							</button>
						))}
					</div>
				</div>

				{/* Right: Image */}
				<div className="lg:col-span-3 relative overflow-hidden">
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
				</div>
			</div>
		</section>
	)
}

function MapSection() {
	const countriesWithCities = useQuery(
		api.functions.homepage.getCountriesWithCities,
	)
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);
	const recentPlaces = useQuery(api.functions.homepage.getRecentPlaces);
	const [selectedCountry, setSelectedCountry] = useState<Id<"country"> | null>(
		null,
	)
	const [focusCityId, setFocusCityId] = useState<Id<"city"> | null>(null);
	const navigate = useNavigate();

	const filteredCities =
		countriesWithCities?.flatMap((country) =>
			selectedCountry === null || selectedCountry === country._id
				? country.cities.map((city) => ({ ...city, countryId: country._id }))
				: [],
		) ?? [];

	const allCities =
		countriesWithCities?.flatMap((country) =>
			country.cities.map((city) => ({ ...city, countryId: country._id })),
		) ?? [];

	const focusCity = focusCityId
		? allCities.find((city) => city._id === focusCityId)
		: null;

	if (countriesWithCities === undefined) {
		return (
			<section className="border-b-2 border-foreground">
				<Skeleton className="h-[550px]" />
			</section>
		)
	}

	return (
		<section className="border-b-2 border-foreground">
			{/* Section label bar */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-3 flex items-center justify-between">
				<h2 className="b-heading text-3xl md:text-4xl uppercase">
					Destinations<span style={{ color: "#FF5D00" }}>.</span>
				</h2>
				<span
					className="text-[10px] text-muted-foreground tracking-[0.1em]"
					style={{ fontFamily: monoFont }}
				>
					// select country to filter
				</span>
			</div>

			{/* Horizontal country filter */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-2 flex items-center gap-0 overflow-x-auto">
				<button
					type="button"
					onClick={() => setSelectedCountry(null)}
					className={cn(
						"shrink-0 px-4 py-2 text-[10px] uppercase tracking-[0.15em] border-r-2 border-foreground transition-colors",
						selectedCountry === null
							? "bg-[#FF5D00] text-white font-bold"
							: "hover:bg-muted/50",
					)}
					style={{ fontFamily: monoFont }}
				>
					All [{countriesWithCities.reduce((s, c) => s + c.cityCount, 0)}]
				</button>
				{countriesWithCities.map((country) => (
					<button
						key={country._id}
						type="button"
						onClick={() => setSelectedCountry(country._id)}
						className={cn(
							"shrink-0 px-4 py-2 text-[10px] uppercase tracking-[0.15em] border-r-2 border-foreground transition-colors",
							selectedCountry === country._id
								? "bg-[#FF5D00] text-white font-bold"
								: "hover:bg-muted/50",
						)}
						style={{ fontFamily: monoFont }}
					>
						{country.name} [{country.cityCount}]
					</button>
				))}
			</div>

			{/* Map */}
			<div className="h-[500px]">
				<Map center={[10, 45]} zoom={3} maxZoom={12}>
					<MapControls position="bottom-right" showZoom showCompass />
					<MapBoundsFitter cities={filteredCities} />
					<MapFocusController city={focusCity} />
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
								<div className="group cursor-pointer transition-transform hover:scale-125">
									<div
										className={cn(
											"b-crosshair",
											city._id === focusCityId && "b-crosshair-active",
										)}
									/>
								</div>
							</MarkerContent>
							<MarkerTooltip>
								<span
									className="text-[10px] font-bold uppercase tracking-[0.1em]"
									style={{ fontFamily: monoFont }}
								>
									{city.name}
								</span>
							</MarkerTooltip>
						</MapMarker>
					))}
				</Map>
			</div>

			{/* Photo + destination tether */}
			<div className="border-t-2 border-foreground b-grid-bg">
				<div className="px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
					<div className="lg:col-span-2">
						<span
							className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground"
							style={{ fontFamily: monoFont }}
						>
							// photo tether
						</span>
						<h3 className="b-heading text-3xl md:text-4xl uppercase mt-2">
							Mapboard
							<span style={{ color: "#FF5D00" }}>.</span>
						</h3>
						<p
							className="text-xs text-muted-foreground mt-3 max-w-sm"
							style={{ fontFamily: monoFont }}
						>
							Hover a photo or destination to pull the map to its coordinates.
						</p>
					</div>
					<div className="lg:col-span-3">
						<div className="b-filmstrip rounded-none overflow-x-auto">
							<div className="flex items-center gap-2 px-3 py-3">
								<div className="flex gap-1">
									{[...Array(6)].map((_, i) => (
										<div key={i} className="b-film-hole" />
									))}
								</div>
								<div className="flex gap-3">
									{featuredImages?.slice(0, 8).map((image) => (
										<button
											key={image._id}
											type="button"
											className="relative shrink-0"
											onMouseEnter={() => {
												if (image.cityId) {
													setFocusCityId(image.cityId as Id<"city">);
												}
											}}
											onFocus={() => {
												if (image.cityId) {
													setFocusCityId(image.cityId as Id<"city">);
												}
											}}
											onClick={() => {
												if (image.cityId && image.countryId) {
													navigate({
														to: "/country/$countryId/city/$cityId",
														params: {
															countryId: image.countryId,
															cityId: image.cityId,
														},
													})
												}
											}}
										>
											<img
												src={image.url}
												alt={image.description ?? image.locationName}
												className="h-24 w-32 object-cover border-2 border-foreground"
											/>
											<span
												className="absolute bottom-1 left-1 text-[9px] text-white bg-black/70 px-1"
												style={{ fontFamily: monoFont }}
											>
												{image.locationName}
											</span>
										</button>
									))}
								</div>
								<div className="flex gap-3">
									{recentPlaces?.slice(0, 6).map((place) => (
										<button
											key={place._id}
											type="button"
											className="relative shrink-0"
											onMouseEnter={() => {
												setFocusCityId(place.cityId as Id<"city">);
											}}
											onFocus={() => {
												setFocusCityId(place.cityId as Id<"city">);
											}}
											onClick={() => {
												if (place.countryId) {
													navigate({
														to: "/country/$countryId/city/$cityId",
														params: {
															countryId: place.countryId,
															cityId: place.cityId,
														},
													})
												}
											}}
										>
											<div className="h-24 w-32 border-2 border-foreground bg-muted flex items-center justify-center">
												{place.iconImage ? (
													<img
														src={place.iconImage}
														alt={place.name}
														className="h-full w-full object-cover"
													/>
												) : (
													<MapPin className="h-6 w-6 text-muted-foreground" />
												)}
											</div>
											<span
												className="absolute bottom-1 left-1 text-[9px] text-white bg-black/70 px-1"
												style={{ fontFamily: monoFont }}
											>
												{place.name}
											</span>
										</button>
									))}
								</div>
								<div className="flex gap-1">
									{[...Array(6)].map((_, i) => (
										<div key={i} className="b-film-hole" />
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

function MapFocusController({
	city,
}: {
	city: { lng: number; lat: number } | null;
}) {
	const { map, isLoaded } = useMap();

	useEffect(() => {
		if (!map || !isLoaded || !city) return;
		map.flyTo({ center: [city.lng, city.lat], zoom: 5, duration: 900 });
	}, [map, isLoaded, city]);

	return null;
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
			<section className="px-4 md:px-8 py-12">
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
			<div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-end justify-between">
				<div>
					<span
						className="text-[10px] text-muted-foreground block mb-1 tracking-[0.1em]"
						style={{ fontFamily: monoFont }}
					>
						// latest additions
					</span>
					<h2 className="b-heading text-3xl md:text-5xl uppercase">
						Recent<span style={{ color: "#FF5D00" }}>.</span>
					</h2>
				</div>
				<span
					className="text-[10px] text-muted-foreground tracking-[0.1em]"
					style={{ fontFamily: monoFont }}
				>
					[{recentPlaces.length} entries]
				</span>
			</div>

			{/* Numbered catalog grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{recentPlaces.slice(0, 12).map((place, i) => (
					<div
						key={place._id}
						className="relative border-b border-r border-foreground/10 b-slide"
						style={{ animationDelay: `${i * 0.04}s` }}
					>
						{/* Index number */}
						<span
							className="absolute top-2 left-3 text-[10px] text-muted-foreground/40 z-10"
							style={{ fontFamily: monoFont }}
						>
							{String(i + 1).padStart(2, "0")}
						</span>
						<PlaceCard place={place} className="h-full rounded-none" />
					</div>
				))}
			</div>
		</section>
	)
}

function CountryShowcaseSection() {
	const countriesWithCities = useQuery(
		api.functions.homepage.getCountriesWithCities,
	)

	if (countriesWithCities === undefined) {
		return (
			<section className="border-b-2 border-foreground">
				<Skeleton className="h-[420px]" />
			</section>
		)
	}

	return (
		<section className="border-b-2 border-foreground">
			<div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-end justify-between">
				<div>
					<span
						className="text-[10px] text-muted-foreground block mb-1 tracking-[0.1em]"
						style={{ fontFamily: monoFont }}
					>
						// passport wall
					</span>
					<h2 className="b-heading text-3xl md:text-5xl uppercase">
						Countries<span style={{ color: "#FF5D00" }}>.</span>
					</h2>
				</div>
				<span
					className="text-[10px] text-muted-foreground tracking-[0.1em]"
					style={{ fontFamily: monoFont }}
				>
					[{countriesWithCities.length} nations]
				</span>
			</div>

			<div className="px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 b-grid-bg">
				{countriesWithCities.map((country, i) => {
					const citiesSorted = [...country.cities].sort((a, b) => {
						const aScore = (a.lastVisitedYear ?? 0) * 12 + (a.lastVisitedMonth ?? 0);
						const bScore = (b.lastVisitedYear ?? 0) * 12 + (b.lastVisitedMonth ?? 0);
						return bScore - aScore;
					})
					const primaryCity = citiesSorted[0] ?? country.cities[0];
					return (
						<div
							key={country._id}
							className="border-2 border-foreground p-5 relative"
						>
							<span
								className="absolute top-2 right-2 text-[10px] text-muted-foreground"
								style={{ fontFamily: monoFont }}
							>
								{String(i + 1).padStart(2, "0")}
							</span>
							<div className="b-stamp inline-flex items-center gap-2 px-3 py-2 uppercase text-xs tracking-[0.2em] b-accent">
								<Globe className="h-3 w-3" />
								{country.name}
							</div>
							<div className="mt-4 flex items-start justify-between gap-4">
								<div>
									<h3 className="b-heading text-3xl uppercase">
										{country.name}
									</h3>
									<p
										className="text-[10px] text-muted-foreground mt-1"
										style={{ fontFamily: monoFont }}
									>
										{country.cityCount} cities logged
									</p>
								</div>
								<div
									className="text-[10px] text-muted-foreground text-right"
									style={{ fontFamily: monoFont }}
								>
									<span className="block">{country.lat?.toFixed(2)}, {country.lng?.toFixed(2)}</span>
									<span className="block">coords</span>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-2">
								{citiesSorted.slice(0, 4).map((city) => (
									<span
										key={city._id}
										className="text-[10px] uppercase tracking-[0.1em] border border-foreground/20 px-2 py-1"
										style={{ fontFamily: monoFont }}
									>
										{city.name}
									</span>
								))}
							</div>

							{primaryCity && (
								<Link
									to="/country/$countryId/city/$cityId"
									params={{
										countryId: country._id,
										cityId: primaryCity._id,
									}}
									className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em]"
									style={{ fontFamily: monoFont, color: "#FF5D00" }}
								>
									Explore {primaryCity.name}
									<ChevronRight className="h-3 w-3" />
								</Link>
							)}
						</div>
					)
				})}
			</div>
		</section>
	)
}

function PhotoShowcaseSection() {
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);

	if (featuredImages === undefined) {
		return (
			<section className="border-b-2 border-foreground">
				<Skeleton className="h-[420px]" />
			</section>
		)
	}

	if (featuredImages.length === 0) return null;

	return (
		<section className="border-t-2 border-foreground b-darkroom text-white">
			<div className="px-4 md:px-8 py-10">
				<div className="flex items-end justify-between gap-4">
					<div>
						<span
							className="text-[10px] tracking-[0.2em] uppercase text-white/60"
							style={{ fontFamily: monoFont }}
						>
							// darkroom contact sheet
						</span>
						<h2 className="b-heading text-3xl md:text-5xl uppercase text-white mt-2">
							Photo Proofs
							<span style={{ color: "#FF5D00" }}>.</span>
						</h2>
					</div>
					<span
						className="text-[10px] text-white/60 tracking-[0.15em]"
						style={{ fontFamily: monoFont }}
					>
						[{featuredImages.length} frames]
					</span>
				</div>

				<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
					{featuredImages.slice(0, 9).map((image, i) => (
						<div key={image._id} className="relative">
							<div className="b-tape h-4 w-24 absolute -top-3 left-4 rotate-[-2deg]" />
							<div className="b-photo-frame bg-white">
								<img
									src={image.url}
									alt={image.description ?? image.locationName}
									className="h-64 w-full object-cover"
								/>
								<div className="px-3 py-2 text-black">
									<span
										className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										frame {String(i + 1).padStart(2, "0")}
									</span>
									<h3 className="b-heading text-2xl uppercase mt-1">
										{image.locationName}
									</h3>
									<p
										className="text-[10px] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										{image.description ?? "archival capture"}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
