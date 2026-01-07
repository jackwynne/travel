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
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* Minimal Header */}
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
				{/* Hero Section */}
				<HeroSection />

				{/* Map Section */}
				<MapSection />

				{/* Places Section */}
				<PlacesSection />
			</main>

			{/* Footer */}
			<footer className="border-t border-border/40 bg-muted/30">
				<div className="container mx-auto px-4 py-8">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Globe className="h-4 w-4" />
							<span className="text-sm">Explore the world, one city at a time</span>
						</div>
						<Link to="/admin">
							<Button variant="outline" className="gap-2">
								<Settings className="h-4 w-4" />
								Admin Portal
							</Button>
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}

// Hero Carousel Section
function HeroSection() {
	const featuredImages = useQuery(api.functions.homepage.getFeaturedImages);
	const [currentSlide, setCurrentSlide] = useState(0);

	if (featuredImages === undefined) {
		return <HeroSkeleton />;
	}

	if (featuredImages.length === 0) {
		return <HeroEmpty />;
	}

	return (
		<section className="relative">
			<Carousel
				opts={{
					loop: true,
					align: "start",
				}}
				className="w-full"
				setApi={(api) => {
					api?.on("select", () => {
						setCurrentSlide(api.selectedScrollSnap());
					});
				}}
				plugins={[
					Autoplay({
					  delay: 3000,
					}),
				  ]}
			>
				<CarouselContent className="ml-0">
					{featuredImages.map((image, index) => (
						<CarouselItem key={image._id} className="pl-0">
							<div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
								{/* Background Image */}
								<img
									src={image.url}
									alt={image.description ?? image.locationName}
									className="absolute inset-0 h-full w-full object-cover"
								/>
								{/* Gradient Overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
								<div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

								{/* Content */}
								<div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
									<div className="max-w-2xl space-y-4">
										<span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm">
											<MapPin className="h-3.5 w-3.5" />
											{image.imageType === "city" ? "Featured City" : "Featured Place"}
										</span>
										<h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
											{image.locationName}
										</h2>
										{image.description && (
											<p className="text-lg text-white/80 line-clamp-2 max-w-lg">
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
											>
												<Button
													size="lg"
													className="mt-4 gap-2 bg-white text-black hover:bg-white/90"
												>
													Explore
													<ArrowRight className="h-4 w-4" />
												</Button>
											</Link>
										)}
									</div>
								</div>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Navigation */}
				<CarouselPrevious className="left-4 md:left-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white" />
				<CarouselNext className="right-4 md:right-8 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white" />

				{/* Dots Indicator */}
				<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
					{featuredImages.map((_, index) => (
						<button
							key={index}
							type="button"
							className={cn(
								"h-2 rounded-full transition-all",
								currentSlide === index
									? "w-8 bg-white"
									: "w-2 bg-white/50 hover:bg-white/70"
							)}
							onClick={() => {
								// Note: API doesn't directly support scrollTo by index in this setup
							}}
						/>
					))}
				</div>
			</Carousel>
		</section>
	);
}

function HeroSkeleton() {
	return (
		<section className="relative h-[70vh] min-h-[500px] w-full bg-muted">
			<div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
				<div className="max-w-2xl space-y-4">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-14 w-96" />
					<Skeleton className="h-5 w-72" />
					<Skeleton className="h-10 w-32 mt-4" />
				</div>
			</div>
		</section>
	);
}

function HeroEmpty() {
	return (
		<section className="relative h-[50vh] min-h-[400px] w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background">
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
				<Plane className="h-16 w-16 text-primary/40 mb-4" />
				<h2 className="text-3xl font-bold text-foreground mb-2">
					Welcome to Travel
				</h2>
				<p className="text-muted-foreground max-w-md">
					Discover amazing destinations. Mark images as featured in the admin
					panel to showcase them here.
				</p>
			</div>
		</section>
	);
}

// Map Section with Country Navigation
function MapSection() {
	const countriesWithCities = useQuery(
		api.functions.homepage.getCountriesWithCities
	);
	const [selectedCountry, setSelectedCountry] = useState<Id<"country"> | null>(
		null
	);
	const navigate = useNavigate();

	const filteredCities =
		countriesWithCities?.flatMap((country) =>
			selectedCountry === null || selectedCountry === country._id
				? country.cities.map((city) => ({ ...city, countryId: country._id }))
				: []
		) ?? [];

	if (countriesWithCities === undefined) {
		return <MapSkeleton />;
	}

	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="mb-8">
					<h2 className="text-3xl font-bold tracking-tight mb-2">
						Explore Destinations
					</h2>
					<p className="text-muted-foreground">
						Select a country to filter cities on the map
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Country Sidebar */}
					<div className="lg:col-span-1">
						<div className="bg-card rounded-xl border border-border/50 overflow-hidden">
							<div className="p-4 border-b border-border/50">
								<h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
									Countries
								</h3>
							</div>
							<nav className="p-2 max-h-[400px] overflow-y-auto">
								{/* All Countries Option */}
								<button
									type="button"
									onClick={() => setSelectedCountry(null)}
									className={cn(
										"w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors",
										selectedCountry === null
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted"
									)}
								>
									<div className="flex items-center gap-2">
										<Globe className="h-4 w-4" />
										<span className="font-medium">All Countries</span>
									</div>
									<span
										className={cn(
											"text-xs px-2 py-0.5 rounded-full",
											selectedCountry === null
												? "bg-primary-foreground/20 text-primary-foreground"
												: "bg-muted-foreground/20 text-muted-foreground"
										)}
									>
										{countriesWithCities.reduce(
											(sum, c) => sum + c.cityCount,
											0
										)}
									</span>
								</button>

								{/* Country List */}
								{countriesWithCities.map((country) => (
									<button
										key={country._id}
										type="button"
										onClick={() => setSelectedCountry(country._id)}
										className={cn(
											"w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors",
											selectedCountry === country._id
												? "bg-primary text-primary-foreground"
												: "hover:bg-muted"
										)}
									>
										<span className="font-medium">{country.name}</span>
										<div className="flex items-center gap-2">
											<span
												className={cn(
													"text-xs px-2 py-0.5 rounded-full",
													selectedCountry === country._id
														? "bg-primary-foreground/20 text-primary-foreground"
														: "bg-muted-foreground/20 text-muted-foreground"
												)}
											>
												{country.cityCount}
											</span>
											<ChevronRight className="h-4 w-4 opacity-50" />
										</div>
									</button>
								))}
							</nav>
						</div>
					</div>

					{/* Map */}
					<div className="lg:col-span-3">
						<div className="h-[500px] rounded-xl overflow-hidden border border-border/50">
							<Map
								center={[10, 45]}
								zoom={3}
								maxZoom={12}
								// maxBounds={[
								// 	[-180, -85],
								// 	[180, 85],
								// ]}
							>
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
											});
										}}
									>
										<MarkerContent>
											<div className="relative group cursor-pointer">
												<div className="h-4 w-4 rounded-full bg-primary border-2 border-white shadow-lg transition-transform group-hover:scale-125" />
												<div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
											</div>
										</MarkerContent>
										<MarkerTooltip>
											<span className="font-medium">{city.name}</span>
										</MarkerTooltip>
									</MapMarker>
								))}
							</Map>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function MapSkeleton() {
	return (
		<section className="py-16 bg-muted/20">
			<div className="container mx-auto px-4">
				<div className="mb-8">
					<Skeleton className="h-9 w-64 mb-2" />
					<Skeleton className="h-5 w-96" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-1">
						<Skeleton className="h-[400px] rounded-xl" />
					</div>
					<div className="lg:col-span-3">
						<Skeleton className="h-[500px] rounded-xl" />
					</div>
				</div>
			</div>
		</section>
	);
}

// Component to fit map bounds - must be a child of Map to use useMap hook
function MapBoundsFitter({
	cities,
}: {
	cities: Array<{ lng: number; lat: number }>;
}) {
	const { map, isLoaded } = useMap();

	useEffect(() => {
		if (!map || !isLoaded || cities.length === 0) return;

		const bounds = cities.reduce(
			(acc, city) => {
				return {
					minLng: Math.min(acc.minLng, city.lng),
					maxLng: Math.max(acc.maxLng, city.lng),
					minLat: Math.min(acc.minLat, city.lat),
					maxLat: Math.max(acc.maxLat, city.lat),
				};
			},
			{
				minLng: Number.POSITIVE_INFINITY,
				maxLng: Number.NEGATIVE_INFINITY,
				minLat: Number.POSITIVE_INFINITY,
				maxLat: Number.NEGATIVE_INFINITY,
			}
		);

		const padding = 60;
		map.fitBounds(
			[
				[bounds.minLng, bounds.minLat],
				[bounds.maxLng, bounds.maxLat],
			],
			{ padding, duration: 800 }
		);
	}, [map, isLoaded, cities]);

	return null;
}

// Places Carousel Section
function PlacesSection() {
	const recentPlaces = useQuery(api.functions.homepage.getRecentPlaces);

	if (recentPlaces === undefined) {
		return <PlacesSkeleton />;
	}

	if (recentPlaces.length === 0) {
		return null;
	}

	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="mb-8">
					<h2 className="text-3xl font-bold tracking-tight mb-2">
						Recent Places
					</h2>
					<p className="text-muted-foreground">
						Discover the latest additions to our collection
					</p>
				</div>

				<div className="px-12">
					<Carousel
						opts={{
							align: "start",
							loop: true,
						}}
						className="w-full"
						plugins={[
							Autoplay({
							  delay: 5000,
							}),
						  ]}
					>
						<CarouselContent className="-ml-4">
							{recentPlaces.map((place) => (
								<CarouselItem
									key={place._id}
									className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
								>
									<PlaceCard place={place} className="h-full" />
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>
			</div>
		</section>
	);
}

function PlacesSkeleton() {
	return (
		<section className="py-16">
			<div className="container mx-auto px-4">
				<div className="mb-8">
					<Skeleton className="h-9 w-48 mb-2" />
					<Skeleton className="h-5 w-80" />
				</div>
				<div className="px-12">
					<div className="flex gap-4 overflow-hidden">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="min-w-[250px]">
								<PlaceCardSkeleton />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
