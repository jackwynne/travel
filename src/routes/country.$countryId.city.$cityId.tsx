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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Map as MapComponent,
	MapControls,
	MapMarker,
	MapRoute,
	MarkerContent,
	MarkerTooltip,
} from "@/components/ui/map";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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

function CityPage() {
	const { countryId, cityId } = Route.useParams();

	// State
	const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
	const [selectedRouteId, setSelectedRouteId] = useState<Id<"route"> | null>(
		null,
	);

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

	if (!city || !country) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* Minimal Header (copied from index) */}
			<header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
				<div className="container mx-auto px-4 h-14 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2 group">
						<div className="relative">
							<Plane className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
							<div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
						<span className="font-semibold text-lg tracking-tight">
							Travel
						</span>
					</Link>
					<ThemeToggle />
				</div>
			</header>

			<main className="flex-1">
				{/* City Title (moved from old header) */}
				<div className="border-b bg-card/50 backdrop-blur-sm">
					<div className="container mx-auto px-4 py-6">
						<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
							<span>{country.name}</span>
							<ChevronRight className="size-4" />
							<span className="text-foreground font-medium">{city.name}</span>
						</div>
						<h1 className="text-3xl font-bold tracking-tight">{city.name}</h1>
						{city.lastVistitedYear && (
							<p className="text-muted-foreground mt-1">
								Last visited: {city.lastVistitedMonth}/{city.lastVistitedYear}
							</p>
						)}
					</div>
				</div>

				<div className="container mx-auto px-4 py-8 space-y-8">
				{/* Map Section */}
				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<MapPin className="size-5" />
							Places
						</h2>
						{/* Category Filter */}
						<div className="flex flex-wrap gap-2">
							<Button
								variant={categoryFilter === null ? "default" : "outline"}
								size="sm"
								onClick={() => setCategoryFilter(null)}
							>
								All ({places?.length ?? 0})
							</Button>
							{categoriesWithCounts.map(({ value, label, count }) => (
								<Button
									key={value}
									variant={categoryFilter === value ? "default" : "outline"}
									size="sm"
									onClick={() => setCategoryFilter(value)}
								>
									{label} ({count})
								</Button>
							))}
						</div>
					</div>

					<div className="rounded-xl overflow-hidden border bg-card h-[500px]">
						<MapComponent center={[city.lng, city.lat]} zoom={13} maxZoom={15}>
							<MapControls position="bottom-right" showZoom showLocate />

							{/* Place markers */}
							{placesWithCoords.map((place) => {
								if (place.lng == null || place.lat == null) return null;
								return (
									<MapMarker
										key={place._id}
										longitude={place.lng}
										latitude={place.lat}
										onClick={() => setSelectedPlace(place)}
									>
										<MarkerContent
											className={cn(
												"size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer transition-transform hover:scale-110",
												getCategoryColor(place.category),
											)}
										>
											{place.name.charAt(0).toUpperCase()}
										</MarkerContent>
										<MarkerTooltip>
											<div className="font-medium">{place.name}</div>
											<div className="text-xs opacity-80">
												{getCategoryLabel(place.category)}
											</div>
										</MarkerTooltip>
									</MapMarker>
								);
							})}

							{/* Route line */}
							{routeCoordinates.length >= 2 && (
								<MapRoute
									coordinates={routeCoordinates}
									color="#ef4444"
									width={4}
									opacity={0.8}
								/>
							)}
						</MapComponent>
					</div>
				</section>

				{/* Places Table Section */}
				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold">All Places</h2>
						<div className="relative w-64">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search places..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
					</div>

					<div className="rounded-xl border bg-card overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Rating</TableHead>
									<TableHead className="w-24" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredPlacesForTable.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={4}
											className="text-center py-8 text-muted-foreground"
										>
											{searchQuery
												? "No places match your search"
												: "No places found"}
										</TableCell>
									</TableRow>
								) : (
									filteredPlacesForTable.map((place) => (
										<TableRow
											key={place._id}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => setSelectedPlace(place)}
										>
											<TableCell className="font-medium">
												{place.name}
											</TableCell>
											<TableCell>
												<Badge variant="secondary">
													{getCategoryLabel(place.category)}
												</Badge>
											</TableCell>
											<TableCell>
												{place.rating != null ? (
													<div className="flex items-center gap-1">
														<Star className="size-4 fill-yellow-400 text-yellow-400" />
														<span>{place.rating.toFixed(1)}</span>
													</div>
												) : (
													<span className="text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="sm">
													View
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</section>

				{/* Routes Section */}
				<section>
					<h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
						<RouteIcon className="size-5" />
						Routes
					</h2>

					{routes && routes.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{routes.map((route) => (
								<RouteCard
									key={route._id}
									route={route}
									places={places ?? []}
									isSelected={selectedRouteId === route._id}
									onSelect={() =>
										setSelectedRouteId(
											selectedRouteId === route._id ? null : route._id,
										)
									}
								/>
							))}
						</div>
					) : (
						<div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
							No routes available for this city
						</div>
					)}
				</section>
				</div>
			</main>

			{/* Footer (copied from index; link updated to current city) */}
			<footer className="border-t border-border/40 bg-muted/30">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Globe className="h-4 w-4" />
							<span className="text-sm">
								Explore the world, one city at a time
							</span>
						</div>
						<Link
							to="/admin/country/$countryId/city/$cityId"
							params={{ countryId, cityId }}
						>
							<Button variant="outline" className="gap-2">
								<Settings className="h-4 w-4" />
								Admin Portal
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
	);
}

// Route Card Component
function RouteCard({
	route,
	places,
	isSelected,
	onSelect,
}: {
	route: RouteDoc;
	places: Place[];
	isSelected: boolean;
	onSelect: () => void;
}) {
	const stopNames = route.stops
		.map((stop) => {
			const place = places.find((p) => p._id === stop.placeId);
			return place?.name;
		})
		.filter(Boolean) as string[];

	return (
		<button
			type="button"
			className={cn(
				"rounded-xl border bg-card p-4 cursor-pointer transition-all text-left w-full",
				isSelected
					? "ring-2 ring-primary border-primary"
					: "hover:border-primary/50",
			)}
			onClick={onSelect}
		>
			<div className="flex items-start justify-between mb-2">
				<h3 className="font-semibold">{route.name}</h3>
				{isSelected && (
					<Badge variant="default" className="text-xs">
						Showing on map
					</Badge>
				)}
			</div>
			{route.description && (
				<p className="text-sm text-muted-foreground mb-3">
					{route.description}
				</p>
			)}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<MapPin className="size-4" />
				<span>{route.stops.length} stops</span>
			</div>
			{stopNames.length > 0 && (
				<div className="mt-3 flex flex-wrap gap-1">
					{stopNames.slice(0, 4).map((name) => (
						<Badge key={name} variant="outline" className="text-xs">
							{name}
						</Badge>
					))}
					{stopNames.length > 4 && (
						<Badge variant="outline" className="text-xs">
							+{stopNames.length - 4} more
						</Badge>
					)}
				</div>
			)}
		</button>
	);
}

// Place Details Dialog Component
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
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{place.name}</DialogTitle>
					<DialogDescription>
						<Badge variant="secondary" className="mt-1">
							{getCategoryLabel(place.category)}
						</Badge>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Rating */}
					{place.rating != null && (
						<div className="flex items-center gap-2">
							<Star className="size-5 fill-yellow-400 text-yellow-400" />
							<span className="font-semibold">{place.rating.toFixed(1)}</span>
							<span className="text-muted-foreground">/ 5</span>
						</div>
					)}

					{/* Description */}
					{place.description && (
						<div>
							<h4 className="text-sm font-medium mb-1">Description</h4>
							<p className="text-sm text-muted-foreground">
								{place.description}
							</p>
						</div>
					)}

					{/* Notes */}
					{place.notes && (
						<div>
							<h4 className="text-sm font-medium mb-1">Notes</h4>
							<p className="text-sm text-muted-foreground">{place.notes}</p>
						</div>
					)}

					{/* Images Gallery */}
					{images && images.length > 0 && (
						<div>
							<h4 className="text-sm font-medium mb-2">Photos</h4>
							<div className="grid grid-cols-2 gap-2">
								{images.map((image) => (
									<div
										key={image._id}
										className="aspect-video rounded-lg overflow-hidden bg-muted"
									>
										<img
											src={image.url}
											alt={image.description ?? place.name}
											className="w-full h-full object-cover"
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Location */}
					{place.lat != null && place.lng != null && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin className="size-4" />
							<span>
								{place.lat.toFixed(6)}, {place.lng.toFixed(6)}
							</span>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Helper function for category colors
function getCategoryColor(category: Category): string {
	const colors: Record<Category, string> = {
		"gallery+museum": "bg-purple-500",
		park: "bg-green-500",
		restaurant: "bg-orange-500",
		"cafe+bakery+snacks": "bg-amber-500",
		"bar+pub+club": "bg-pink-500",
		rooftop_bar: "bg-rose-500",
		hotel: "bg-blue-500",
		"theatre+concert_hall+venue": "bg-indigo-500",
		"landmark+church+view": "bg-teal-500",
		other: "bg-gray-500",
	};
	return colors[category] ?? "bg-gray-500";
}
