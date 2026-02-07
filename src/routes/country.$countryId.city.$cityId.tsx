import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ChevronRight,
	Globe,
	MapPin,
	Plane,
	Route as RouteIcon,
	Search,
	Settings,
	Star,
	ArrowUpRight,
	Camera,
	Navigation,
	Layers,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Map as MapComponent,
	MapControls,
	MapMarker,
	MapRoute,
	MarkerContent,
	MarkerTooltip,
	useMap,
} from "@/components/ui/map";
import {
	type Category,
	getAllCategories,
	getCategoryLabel,
} from "@/lib/category-utils";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/country/$countryId/city/$cityId")({
	component: CityPage,
});

type Place = Doc<"place">;
type RouteDoc = Doc<"route">;

const monoFont = "'Space Mono', 'Courier New', monospace";
const displayFont = "'Instrument Serif', 'Georgia', serif";

function CityPage() {
	const { countryId, cityId } = Route.useParams();

	// State
	const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
	const [selectedRouteId, setSelectedRouteId] = useState<Id<"route"> | null>(
		null,
	);
	const [focusedPlace, setFocusedPlace] = useState<Place | null>(null);

	// Data fetching
	const city = useQuery(api.functions.city.getOne, {
		id: cityId as Id<"city">,
	});
	const country = useQuery(api.functions.country.getOne, {
		id: countryId as Id<"country">,
	});
	const places = useQuery(api.functions.place.getMany, {
		cityId: cityId as Id<"city">,
	});
	const routes = useQuery(api.functions.route.getMany, {
		cityId: cityId as Id<"city">,
	});
	const cityImages = useQuery(api.functions.image.getByCity, {
		cityId: cityId as Id<"city">,
	});

	// Filter places by category
	const filteredPlacesByCategory = useMemo(() => {
		if (!places) return [];
		if (!categoryFilter) return places;
		return places.filter((place) => place.category === categoryFilter);
	}, [places, categoryFilter]);

	// Filter places by search query (for table)
	const filteredPlacesForTable = useMemo(() => {
		if (!filteredPlacesByCategory) return [];
		if (!searchQuery.trim()) return filteredPlacesByCategory;
		const query = searchQuery.toLowerCase();
		return filteredPlacesByCategory.filter(
			(place) =>
				place.name.toLowerCase().includes(query) ||
				place.description?.toLowerCase().includes(query),
		);
	}, [filteredPlacesByCategory, searchQuery]);

	// Places with coordinates for map
	const placesWithCoords = useMemo(() => {
		return filteredPlacesByCategory.filter(
			(place) => place.lat != null && place.lng != null,
		);
	}, [filteredPlacesByCategory]);

	// Get selected route details
	const selectedRoute = useMemo(() => {
		if (!selectedRouteId || !routes) return null;
		return routes.find((r) => r._id === selectedRouteId) ?? null;
	}, [selectedRouteId, routes]);

	// Get route coordinates
	const routeCoordinates = useMemo(() => {
		if (!selectedRoute || !places) return [];
		const coords: [number, number][] = [];
		for (const stop of selectedRoute.stops) {
			const place = places.find((p) => p._id === stop.placeId);
			if (place?.lng != null && place?.lat != null) {
				coords.push([place.lng, place.lat]);
			}
		}
		return coords;
	}, [selectedRoute, places]);

	// Categories with counts
	const categoriesWithCounts = useMemo(() => {
		if (!places) return [];
		const counts: Record<string, number> = {};
		for (const place of places) {
			counts[place.category] = (counts[place.category] ?? 0) + 1;
		}
		return getAllCategories()
			.filter(({ value }) => value in counts)
			.map(({ value, label }) => ({
				value,
				label,
				count: counts[value] ?? 0,
			}));
	}, [places]);

	// Stats
	const stats = useMemo(() => {
		if (!places) return null;
		const rated = places.filter((p) => p.rating != null);
		const avgRating =
			rated.length > 0
				? rated.reduce((s, p) => s + (p.rating ?? 0), 0) / rated.length
				: null;
		const withCoords = places.filter(
			(p) => p.lat != null && p.lng != null,
		).length;
		return {
			total: places.length,
			categories: categoriesWithCounts.length,
			avgRating,
			mapped: withCoords,
			images: cityImages?.length ?? 0,
			routes: routes?.length ?? 0,
		};
	}, [places, categoriesWithCounts, cityImages, routes]);

	if (!city || !country) {
		return (
			<>
				<style>{cityPageStyles}</style>
				<div className="min-h-screen flex items-center justify-center bg-background">
					<span
						className="text-sm text-muted-foreground animate-pulse"
						style={{ fontFamily: monoFont }}
					>
						loading_
					</span>
				</div>
			</>
		);
	}

	return (
		<>
			<style>{cityPageStyles}</style>

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
										{city.name} &bull;{" "}
										<Link
											to="/country/$countryId"
											params={{ countryId: country._id }}
											className="text-background/90 hover:text-background transition-colors"
										>
											{country.name}
										</Link>
										 &bull;{" "}
								{city.lat.toFixed(4)}N, {city.lng.toFixed(4)}E &bull;{" "}
								{stats?.total ?? 0} Places Logged &bull;{" "}
								{stats?.images ?? 0} Photos &bull;&nbsp;
							</span>
						))}
					</div>
				</div>

				{/* Header */}
				<header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
					<div className="px-4 md:px-8">
						<div className="h-12 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<Link to="/" className="flex items-center gap-3 group">
									<span
										className="text-sm font-bold tracking-[0.4em] uppercase"
										style={{ fontFamily: monoFont }}
									>
										TRAVEL
									</span>
									<span className="b-travel-icon b-icon-pulse text-[#FF5D00]">
										<Plane className="h-4 w-4" />
										<span className="b-icon-orbit" />
									</span>
								</Link>
								<ChevronRight className="size-3 text-muted-foreground" />
								<Link
									to="/country/$countryId"
									params={{ countryId: country._id }}
									className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
									style={{ fontFamily: monoFont }}
								>
									{country.name}
								</Link>
								<ChevronRight className="size-3 text-muted-foreground" />
								<span
									className="text-[10px] tracking-[0.15em] uppercase"
									style={{ fontFamily: monoFont, color: "#FF5D00" }}
								>
									{city.name}
								</span>
							</div>
							<div className="flex items-center gap-4">
								<span
									className="hidden md:inline text-[10px] text-muted-foreground tracking-[0.15em]"
									style={{ fontFamily: monoFont }}
								>
									[{city.lat.toFixed(2)}, {city.lng.toFixed(2)}]
								</span>
								<ThemeToggle />
							</div>
						</div>
					</div>
				</header>

				<main className="flex-1">
					{/* Hero Section */}
					<CityHeroSection
						city={city}
						country={country}
						stats={stats}
						cityImages={cityImages}
					/>

					{/* Stats Bar */}
					{stats && <StatsBar stats={stats} />}

					{/* Map Section */}
					<MapSection
						city={city}
						placesWithCoords={placesWithCoords}
						routeCoordinates={routeCoordinates}
						categoryFilter={categoryFilter}
						setCategoryFilter={setCategoryFilter}
						categoriesWithCounts={categoriesWithCounts}
						totalPlaces={places?.length ?? 0}
						onPlaceSelect={setSelectedPlace}
						focusedPlace={focusedPlace}
					/>

					{/* Places Catalog Section */}
					<PlacesCatalogSection
						places={filteredPlacesForTable}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						onPlaceSelect={setSelectedPlace}
						onPlaceHover={setFocusedPlace}
						totalFiltered={filteredPlacesByCategory.length}
					/>

					{/* Photo Gallery Section */}
					{cityImages && cityImages.length > 0 && (
						<PhotoGallerySection
							images={cityImages}
							cityName={city.name}
						/>
					)}

					{/* Routes Section */}
					{routes && routes.length > 0 && (
						<RoutesSection
							routes={routes}
							places={places ?? []}
							selectedRouteId={selectedRouteId}
							onRouteSelect={setSelectedRouteId}
						/>
					)}
				</main>

				{/* Footer */}
				<footer className="border-t-2 border-foreground">
					<div className="px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<span
							className="text-[10px] text-muted-foreground tracking-[0.1em]"
							style={{ fontFamily: monoFont }}
						>
							// {city.name}, {" "}
							<Link
								to="/country/$countryId"
								params={{ countryId: country._id }}
								className="hover:text-foreground transition-colors"
							>
								{country.name}
							</Link>
							 &mdash; city archive
						</span>
						<div className="flex items-center gap-3">
							<Link to="/">
								<Button
									variant="outline"
									size="sm"
									className="gap-2 rounded-none border-2 border-foreground text-foreground text-[10px] tracking-[0.15em] uppercase hover:bg-[#FF5D00] hover:text-white hover:border-[#FF5D00]"
									style={{ fontFamily: monoFont }}
								>
									<Globe className="h-3 w-3" />
									All Cities
								</Button>
							</Link>
							<Link
								to="/admin/country/$countryId/city/$cityId"
								params={{ countryId, cityId }}
							>
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
					</div>
				</footer>

				{/* Place Details Dialog */}
				<PlaceDetailsDialog
					place={selectedPlace}
					onClose={() => setSelectedPlace(null)}
				/>
			</div>
		</>
	);
}

// ─── City Hero Section ───────────────────────────────────────────────────────

function CityHeroSection({
	city,
	country,
	stats,
	cityImages,
}: {
	city: Doc<"city">;
	country: Doc<"country">;
	stats: {
		total: number;
		categories: number;
		avgRating: number | null;
		mapped: number;
		images: number;
		routes: number;
	} | null;
	cityImages:
		| Array<{
				_id: Id<"image">;
				url: string;
				description?: string | null;
		  }>
		| undefined;
}) {
	const heroImage = cityImages?.[0];

	return (
		<section className="border-b-2 border-foreground">
			<div className="grid grid-cols-1 lg:grid-cols-5 min-h-[55vh]">
				{/* Left: Typography */}
				<div className="lg:col-span-2 flex flex-col justify-between p-6 md:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground">
					{/* Top metadata */}
					<div className="flex items-center justify-between">
						<span
							className="text-[10px] text-muted-foreground tracking-[0.15em]"
							style={{ fontFamily: monoFont }}
						>
							{city.lat.toFixed(4)}N
						</span>
						<span
							className="text-[10px] tracking-[0.15em] uppercase"
							style={{ fontFamily: monoFont, color: "#FF5D00" }}
						>
							[City Archive]
						</span>
					</div>

					{/* Title */}
					<div className="py-8 b-slide">
						<Link
							to="/country/$countryId"
							params={{ countryId: country._id }}
							className="b-stamp inline-flex items-center gap-2 px-3 py-2 uppercase text-xs tracking-[0.2em] b-accent mb-6 hover:text-foreground transition-colors"
						>
							<Globe className="h-3 w-3" />
							{country.name}
						</Link>

						<h1 className="b-heading text-5xl md:text-7xl xl:text-8xl uppercase mb-4">
							{city.name}
						</h1>

						{city.lastVistitedYear && (
							<p
								className="text-xs text-muted-foreground max-w-sm leading-relaxed"
								style={{ fontFamily: monoFont }}
							>
								Last visited: {city.lastVistitedMonth}/{city.lastVistitedYear}
							</p>
						)}
					</div>

					{/* Bottom metadata */}
					<div className="flex items-center gap-6">
						<div
							className="text-[10px] text-muted-foreground"
							style={{ fontFamily: monoFont }}
						>
							<span className="block">
								{city.lng.toFixed(4)}E
							</span>
							<span className="block text-foreground">
								coords
							</span>
						</div>
						{stats && (
							<div
								className="text-[10px] text-muted-foreground"
								style={{ fontFamily: monoFont }}
							>
								<span className="block">{stats.total} places</span>
								<span className="block text-foreground">
									logged
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Right: Hero Image or City Map Preview */}
				<div className="lg:col-span-3 relative overflow-hidden bg-muted">
					{heroImage ? (
						<img
							src={heroImage.url}
							alt={heroImage.description ?? city.name}
							className="absolute inset-0 h-full w-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 b-grid-bg flex items-center justify-center">
							<div className="text-center">
								<MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
								<span
									className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase"
									style={{ fontFamily: monoFont }}
								>
									no images yet
								</span>
							</div>
						</div>
					)}
					{/* Overlay metadata */}
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
						<span
							className="text-[9px] text-white/60 uppercase tracking-[0.15em]"
							style={{ fontFamily: monoFont }}
						>
							{city.name}, {" "}
							<Link
								to="/country/$countryId"
								params={{ countryId: country._id }}
								className="text-white/80 hover:text-white transition-colors"
							>
								{country.name}
							</Link>
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({
	stats,
}: {
	stats: {
		total: number;
		categories: number;
		avgRating: number | null;
		mapped: number;
		images: number;
		routes: number;
	};
}) {
	const items = [
		{ label: "Places", value: String(stats.total), icon: MapPin },
		{ label: "Categories", value: String(stats.categories), icon: Layers },
		{
			label: "Avg Rating",
			value: stats.avgRating ? stats.avgRating.toFixed(1) : "—",
			icon: Star,
		},
		{ label: "Mapped", value: String(stats.mapped), icon: Navigation },
		{ label: "Photos", value: String(stats.images), icon: Camera },
		{ label: "Routes", value: String(stats.routes), icon: RouteIcon },
	];

	return (
		<div className="border-b-2 border-foreground overflow-x-auto">
			<div className="flex">
				{items.map((item) => (
					<div
						key={item.label}
						className="flex-1 min-w-[120px] px-4 py-3 border-r-2 border-foreground last:border-r-0 flex items-center gap-3"
					>
						<item.icon className="size-4 text-[#FF5D00] shrink-0" />
						<div>
							<div
								className="text-lg font-bold"
								style={{ fontFamily: displayFont }}
							>
								{item.value}
							</div>
							<div
								className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground"
								style={{ fontFamily: monoFont }}
							>
								{item.label}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Map Section ─────────────────────────────────────────────────────────────

function MapFocusController({
	location,
}: {
	location: { lng: number; lat: number } | null;
}) {
	const { map, isLoaded } = useMap();

	useEffect(() => {
		if (!map || !isLoaded || !location) return;
		map.flyTo({
			center: [location.lng, location.lat],
			zoom: 16,
			duration: 900,
		});
	}, [map, isLoaded, location]);

	return null;
}

function MapSection({
	city,
	placesWithCoords,
	routeCoordinates,
	categoryFilter,
	setCategoryFilter,
	categoriesWithCounts,
	totalPlaces,
	onPlaceSelect,
	focusedPlace,
}: {
	city: Doc<"city">;
	placesWithCoords: Place[];
	routeCoordinates: [number, number][];
	categoryFilter: Category | null;
	setCategoryFilter: (cat: Category | null) => void;
	categoriesWithCounts: Array<{
		value: Category;
		label: string;
		count: number;
	}>;
	totalPlaces: number;
	onPlaceSelect: (place: Place) => void;
	focusedPlace: Place | null;
}) {
	return (
		<section className="border-b-2 border-foreground">
			{/* Section label bar */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-3 flex items-center justify-between">
				<h2 className="b-heading text-3xl md:text-4xl uppercase">
					Map<span style={{ color: "#FF5D00" }}>.</span>
				</h2>
				<span
					className="text-[10px] text-muted-foreground tracking-[0.1em]"
					style={{ fontFamily: monoFont }}
				>
					// {placesWithCoords.length} mapped coordinates
				</span>
			</div>

			{/* Category filter bar */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-2 flex items-center gap-0 overflow-x-auto">
				<button
					type="button"
					onClick={() => setCategoryFilter(null)}
					className={cn(
						"shrink-0 px-4 py-2 text-[10px] uppercase tracking-[0.15em] border-r-2 border-foreground transition-colors",
						categoryFilter === null
							? "bg-[#FF5D00] text-white font-bold"
							: "hover:bg-muted/50",
					)}
					style={{ fontFamily: monoFont }}
				>
					All [{totalPlaces}]
				</button>
				{categoriesWithCounts.map(({ value, label, count }) => (
					<button
						key={value}
						type="button"
						onClick={() => setCategoryFilter(value)}
						className={cn(
							"shrink-0 px-4 py-2 text-[10px] uppercase tracking-[0.15em] border-r-2 border-foreground transition-colors",
							categoryFilter === value
								? "bg-[#FF5D00] text-white font-bold"
								: "hover:bg-muted/50",
						)}
						style={{ fontFamily: monoFont }}
					>
						{label} [{count}]
					</button>
				))}
			</div>

			{/* Map */}
			<div className="h-[550px]">
				<MapComponent center={[city.lng, city.lat]} zoom={13} maxZoom={18}>
					<MapControls position="bottom-right" showZoom showCompass />
					<MapFocusController
						location={
							focusedPlace?.lat != null && focusedPlace?.lng != null
								? { lat: focusedPlace.lat, lng: focusedPlace.lng }
								: null
						}
					/>

					{/* Place markers */}
					{placesWithCoords.map((place) => {
						if (place.lng == null || place.lat == null) return null;
						return (
							<MapMarker
								key={place._id}
								longitude={place.lng}
								latitude={place.lat}
								onClick={() => onPlaceSelect(place)}
							>
								<MarkerContent>
									<div className="group cursor-pointer transition-transform hover:scale-125">
										<div
											className={cn(
												"b-crosshair",
												focusedPlace?._id === place._id &&
													"b-crosshair-active",
											)}
										/>
									</div>
								</MarkerContent>
								<MarkerTooltip>
									<div style={{ fontFamily: monoFont }}>
										<div className="text-[10px] font-bold uppercase tracking-[0.1em]">
											{place.name}
										</div>
										<div className="text-[9px] opacity-70">
											{getCategoryLabel(place.category)}
										</div>
									</div>
								</MarkerTooltip>
							</MapMarker>
						);
					})}

					{/* Route line */}
					{routeCoordinates.length >= 2 && (
						<MapRoute
							coordinates={routeCoordinates}
							color="#FF5D00"
							width={3}
							opacity={0.8}
							dashArray={[8, 4]}
						/>
					)}
				</MapComponent>
			</div>
		</section>
	);
}

// ─── Places Catalog Section ──────────────────────────────────────────────────

function PlacesCatalogSection({
	places,
	searchQuery,
	setSearchQuery,
	onPlaceSelect,
	onPlaceHover,
	totalFiltered,
}: {
	places: Place[];
	searchQuery: string;
	setSearchQuery: (q: string) => void;
	onPlaceSelect: (place: Place) => void;
	onPlaceHover: (place: Place | null) => void;
	totalFiltered: number;
}) {
	return (
		<section className="border-b-2 border-foreground">
			{/* Section header */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-end justify-between">
				<div>
					<span
						className="text-[10px] text-muted-foreground block mb-1 tracking-[0.1em]"
						style={{ fontFamily: monoFont }}
					>
						// complete catalog, indexed
					</span>
					<h2 className="b-heading text-3xl md:text-5xl uppercase">
						Places<span style={{ color: "#FF5D00" }}>.</span>
					</h2>
				</div>
				<div className="flex items-center gap-4">
					<span
						className="text-[10px] text-muted-foreground tracking-[0.1em] hidden sm:inline"
						style={{ fontFamily: monoFont }}
					>
						[{totalFiltered} entries]
					</span>
					<div className="relative w-48 md:w-64">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
						<input
							placeholder="search..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-8 pr-3 py-2 text-[11px] tracking-[0.05em] bg-transparent border-2 border-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5D00] transition-colors"
							style={{ fontFamily: monoFont }}
						/>
					</div>
				</div>
			</div>

			{/* Places grid */}
			<div className="px-4 md:px-8 py-8 b-grid-bg">
				{places.length === 0 ? (
					<div className="py-16 text-center">
						<span
							className="text-[11px] text-muted-foreground tracking-[0.1em]"
							style={{ fontFamily: monoFont }}
						>
							{searchQuery
								? "// no places match your search"
								: "// no places found"}
						</span>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
						{places.map((place, i) => (
							<button
								key={place._id}
								type="button"
								className="text-left border-2 border-foreground -mt-[2px] -ml-[2px] first:mt-0 p-5 hover:bg-[#FF5D00]/5 transition-colors group cursor-pointer relative"
								onClick={() => onPlaceSelect(place)}
								onMouseEnter={() => onPlaceHover(place)}
								onMouseLeave={() => onPlaceHover(null)}
								onFocus={() => onPlaceHover(place)}
								onBlur={() => onPlaceHover(null)}
							>
								{/* Index number */}
								<span
									className="absolute top-2 right-3 text-[10px] text-muted-foreground"
									style={{ fontFamily: monoFont }}
								>
									{String(i + 1).padStart(2, "0")}
								</span>

								<div className="flex items-start gap-4">
									{/* Icon */}
									{place.iconImage ? (
										<div className="w-16 h-16 shrink-0 border-2 border-foreground overflow-hidden">
											<img
												src={place.iconImage}
												alt={place.name}
												className="w-full h-full object-cover"
											/>
										</div>
									) : (
										<div className="w-16 h-16 shrink-0 border-2 border-foreground/20 flex items-center justify-center bg-muted/30">
											<MapPin className="size-5 text-muted-foreground" />
										</div>
									)}

									<div className="flex-1 min-w-0">
										<h3 className="b-heading text-xl uppercase group-hover:text-[#FF5D00] transition-colors truncate">
											{place.name}
										</h3>
										<div className="flex items-center gap-3 mt-1">
											<span
												className="text-[9px] uppercase tracking-[0.15em] b-accent"
												style={{ fontFamily: monoFont }}
											>
												{getCategoryLabel(place.category)}
											</span>
											{place.rating != null && (
												<span
													className="text-[9px] tracking-[0.1em] text-muted-foreground flex items-center gap-1"
													style={{ fontFamily: monoFont }}
												>
													<Star className="size-3 fill-[#FF5D00] text-[#FF5D00]" />
													{place.rating.toFixed(1)}
												</span>
											)}
										</div>
										{place.description && (
											<p
												className="text-[10px] text-muted-foreground mt-2 line-clamp-2"
												style={{ fontFamily: monoFont }}
											>
												{place.description}
											</p>
										)}
									</div>
								</div>

								{/* Bottom metadata */}
								<div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10">
									{place.lat != null && place.lng != null ? (
										<span
											className="text-[8px] text-muted-foreground tracking-[0.1em]"
											style={{ fontFamily: monoFont }}
										>
											{place.lat.toFixed(4)}, {place.lng.toFixed(4)}
										</span>
									) : (
										<span
											className="text-[8px] text-muted-foreground tracking-[0.1em]"
											style={{ fontFamily: monoFont }}
										>
											no coords
										</span>
									)}
									<span
										className="text-[9px] uppercase tracking-[0.1em] text-[#FF5D00] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
										style={{ fontFamily: monoFont }}
									>
										View
										<ArrowUpRight className="size-3" />
									</span>
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</section>
	);
}

// ─── Photo Gallery Section ───────────────────────────────────────────────────

function PhotoGallerySection({
	images,
	cityName,
}: {
	images: Array<{
		_id: Id<"image">;
		url: string;
		description?: string | null;
	}>;
	cityName: string;
}) {
	return (
		<section className="border-b-2 border-foreground b-darkroom text-white">
			<div className="px-4 md:px-8 py-10">
				<div className="flex items-end justify-between gap-4 mb-8">
					<div>
						<span
							className="text-[10px] tracking-[0.2em] uppercase text-white/60"
							style={{ fontFamily: monoFont }}
						>
							// {cityName} contact sheet
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
						[{images.length} frames]
					</span>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{images.slice(0, 12).map((image, i) => (
						<div key={image._id} className="relative">
							<div className="b-tape h-3 w-16 absolute -top-2 left-3 rotate-[-1deg]" />
							<div className="b-photo-frame bg-white">
								<img
									src={image.url}
									alt={image.description ?? cityName}
									className="h-40 md:h-48 w-full object-cover"
								/>
								<div className="px-2 py-1.5 text-black">
									<span
										className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										frame {String(i + 1).padStart(2, "0")}
									</span>
									{image.description && (
										<p
											className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1"
											style={{ fontFamily: monoFont }}
										>
											{image.description}
										</p>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ─── Routes Section ──────────────────────────────────────────────────────────

function RoutesSection({
	routes,
	places,
	selectedRouteId,
	onRouteSelect,
}: {
	routes: RouteDoc[];
	places: Place[];
	selectedRouteId: Id<"route"> | null;
	onRouteSelect: (id: Id<"route"> | null) => void;
}) {
	return (
		<section className="border-b-2 border-foreground">
			{/* Section header */}
			<div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-end justify-between">
				<div>
					<span
						className="text-[10px] text-muted-foreground block mb-1 tracking-[0.1em]"
						style={{ fontFamily: monoFont }}
					>
						// curated walking paths
					</span>
					<h2 className="b-heading text-3xl md:text-5xl uppercase">
						Routes<span style={{ color: "#FF5D00" }}>.</span>
					</h2>
				</div>
				<span
					className="text-[10px] text-muted-foreground tracking-[0.1em]"
					style={{ fontFamily: monoFont }}
				>
					[{routes.length} itineraries]
				</span>
			</div>

			<div className="px-4 md:px-8 py-8 b-grid-bg">
				<div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3">
					{routes.map((route, i) => {
						const isSelected = selectedRouteId === route._id;
						const stopNames = route.stops
							.map((stop) => {
								const place = places.find(
									(p) => p._id === stop.placeId,
								);
								return place?.name;
							})
							.filter(Boolean) as string[];

						return (
							<button
								key={route._id}
								type="button"
								className={cn(
									"text-left border-2 border-foreground -mt-[2px] -ml-[2px] p-5 transition-all cursor-pointer relative",
									isSelected
										? "bg-[#FF5D00]/10 border-[#FF5D00]"
										: "hover:bg-muted/30",
								)}
								onClick={() =>
									onRouteSelect(isSelected ? null : route._id)
								}
							>
								{/* Index */}
								<span
									className="absolute top-2 right-3 text-[10px] text-muted-foreground"
									style={{ fontFamily: monoFont }}
								>
									{String(i + 1).padStart(2, "0")}
								</span>

								<div className="flex items-center gap-2 mb-2">
									<RouteIcon className="size-4 text-[#FF5D00]" />
									<h3 className="b-heading text-xl uppercase">
										{route.name}
									</h3>
								</div>

								{isSelected && (
									<div className="b-stamp inline-flex items-center px-2 py-1 text-[9px] uppercase tracking-[0.15em] b-accent mb-2">
										showing on map
									</div>
								)}

								{route.description && (
									<p
										className="text-[10px] text-muted-foreground mb-3"
										style={{ fontFamily: monoFont }}
									>
										{route.description}
									</p>
								)}

								<div
									className="flex items-center gap-2 text-[9px] text-muted-foreground"
									style={{ fontFamily: monoFont }}
								>
									<MapPin className="size-3" />
									<span>{route.stops.length} stops</span>
								</div>

								{stopNames.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1">
										{stopNames.slice(0, 4).map((name) => (
											<span
												key={name}
												className="text-[9px] uppercase tracking-[0.1em] border border-foreground/20 px-2 py-0.5"
												style={{ fontFamily: monoFont }}
											>
												{name}
											</span>
										))}
										{stopNames.length > 4 && (
											<span
												className="text-[9px] uppercase tracking-[0.1em] border border-foreground/20 px-2 py-0.5"
												style={{ fontFamily: monoFont }}
											>
												+{stopNames.length - 4} more
											</span>
										)}
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
}

// ─── Place Details Dialog ────────────────────────────────────────────────────

function PlaceDetailsDialog({
	place,
	onClose,
}: {
	place: Place | null;
	onClose: () => void;
}) {
	const images = useQuery(
		api.functions.image.getByPlace,
		place ? { placeId: place._id } : "skip",
	);

	if (!place) return null;

	return (
		<Dialog open={!!place} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg rounded-none border-2 border-foreground">
				<DialogHeader>
					<DialogTitle
						className="b-heading text-3xl uppercase"
						style={{ lineHeight: 0.9 }}
					>
						{place.name}
					</DialogTitle>
					<DialogDescription className="mt-2">
						<span
							className="b-stamp inline-flex items-center px-2 py-1 text-[9px] uppercase tracking-[0.15em] b-accent"
							style={{ fontFamily: monoFont }}
						>
							{getCategoryLabel(place.category)}
						</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 mt-2">
					{/* Rating */}
					{place.rating != null && (
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										className={cn(
											"size-4",
											star <= Math.round(place.rating!)
												? "fill-[#FF5D00] text-[#FF5D00]"
												: "text-foreground/20",
										)}
									/>
								))}
							</div>
							<span
								className="text-sm font-bold"
								style={{ fontFamily: monoFont }}
							>
								{place.rating.toFixed(1)}
							</span>
							<span
								className="text-[10px] text-muted-foreground"
								style={{ fontFamily: monoFont }}
							>
								/ 5
							</span>
						</div>
					)}

					{/* Description */}
					{place.description && (
						<div>
							<h4
								className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2"
								style={{ fontFamily: monoFont }}
							>
								Description
							</h4>
							<p
								className="text-sm text-foreground/80"
								style={{ fontFamily: monoFont }}
							>
								{place.description}
							</p>
						</div>
					)}

					{/* Notes */}
					{place.notes && (
						<div>
							<h4
								className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2"
								style={{ fontFamily: monoFont }}
							>
								Notes
							</h4>
							<p
								className="text-sm text-foreground/80"
								style={{ fontFamily: monoFont }}
							>
								{place.notes}
							</p>
						</div>
					)}

					{/* Images Gallery */}
					{images && images.length > 0 && (
						<div>
							<h4
								className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2"
								style={{ fontFamily: monoFont }}
							>
								Photos [{images.length}]
							</h4>
							<div className="grid grid-cols-2 gap-2">
								{images.map((image) => (
									<div
										key={image._id}
										className="border-2 border-foreground overflow-hidden"
									>
										<img
											src={image.url}
											alt={image.description ?? place.name}
											className="w-full h-32 object-cover"
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Location */}
					{place.lat != null && place.lng != null && (
						<div className="flex items-center gap-2 pt-2 border-t border-foreground/10">
							<MapPin className="size-3 text-[#FF5D00]" />
							<span
								className="text-[10px] text-muted-foreground"
								style={{ fontFamily: monoFont }}
							>
								{place.lat.toFixed(6)}, {place.lng.toFixed(6)}
							</span>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const cityPageStyles = `
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
		opacity: 0;
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
		width: 14px;
		height: 14px;
	}

	.b-crosshair::before,
	.b-crosshair::after {
		content: "";
		position: absolute;
		background: #FF5D00;
	}

	.b-crosshair::before {
		width: 2px;
		height: 100%;
		left: 50%;
		transform: translateX(-50%);
	}

	.b-crosshair::after {
		width: 100%;
		height: 2px;
		top: 50%;
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

	.b-photo-frame {
		box-shadow: 0 12px 40px rgba(0,0,0,0.12);
		border: 8px solid #fff;
	}

	.b-darkroom {
		background: radial-gradient(circle at 20% 20%, rgba(255,93,0,0.12), transparent 45%),
			linear-gradient(180deg, #0f0f0f 0%, #111 60%, #0a0a0a 100%);
	}

	.b-tape {
		background: repeating-linear-gradient(135deg, rgba(255,93,0,0.2) 0 8px, rgba(255,255,255,0.2) 8px 16px);
	}

	.b-travel-icon {
		width: 22px;
		height: 22px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.b-icon-pulse {
		animation: bPulse 2.4s ease-in-out infinite;
	}

	.b-icon-orbit {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 1.5px solid currentColor;
		border-radius: 999px;
		opacity: 0.5;
		animation: bOrbit 4s ease-in-out infinite;
	}

	@keyframes bPulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	@keyframes bOrbit {
		0%, 100% { transform: scale(1); opacity: 0.4; }
		50% { transform: scale(1.15); opacity: 0.7; }
	}
`;
