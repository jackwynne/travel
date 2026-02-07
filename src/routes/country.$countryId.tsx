import {
	Link,
	Outlet,
	createFileRoute,
	useRouterState,
} from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
	ArrowUpRight,
	ChevronRight,
	Globe,
	MapPin,
	Plane,
	Settings,
	Calendar,
	Navigation,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Map as MapComponent,
	MapControls,
	MapMarker,
	MarkerContent,
	MarkerTooltip,
	useMap,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/country/$countryId")({
	component: CountryPage,
});

const monoFont = "'Space Mono', 'Courier New', monospace";
const displayFont = "'Instrument Serif', 'Georgia', serif";

function CountryPage() {
	const { countryId } = Route.useParams();
	const isCityRoute = useRouterState({
		select: (state) =>
			state.location.pathname.includes(`/country/${countryId}/city/`),
	});

	const country = useQuery(
		api.functions.country.getOne,
		isCityRoute ? "skip" : { id: countryId as Id<"country"> },
	);
	const cities = useQuery(
		api.functions.city.getMany,
		isCityRoute ? "skip" : { countryId: countryId as Id<"country"> },
	);

	const citiesSorted = useMemo(() => {
		if (!cities) return [];
		return [...cities].sort((a, b) => {
			const aScore =
				(a.lastVistitedYear ?? 0) * 12 + (a.lastVistitedMonth ?? 0);
			const bScore =
				(b.lastVistitedYear ?? 0) * 12 + (b.lastVistitedMonth ?? 0);
			return bScore - aScore;
		});
	}, [cities]);

	if (isCityRoute) {
		return <Outlet />;
	}

	if (!country) {
		return (
			<>
				<style>{countryPageStyles}</style>
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
			<style>{countryPageStyles}</style>

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
								{country.name} &bull; {country.lat.toFixed(4)}N,{" "}
								{country.lng.toFixed(4)}E &bull;{" "}
								{citiesSorted.length} Cities Logged &bull;
								Country Archive &bull;&nbsp;
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
								<span
									className="text-[10px] tracking-[0.15em] uppercase"
									style={{ fontFamily: monoFont, color: "#FF5D00" }}
								>
									{country.name}
								</span>
							</div>
							<div className="flex items-center gap-4">
								<span
									className="hidden md:inline text-[10px] text-muted-foreground tracking-[0.15em]"
									style={{ fontFamily: monoFont }}
								>
									[{country.lat.toFixed(2)}, {country.lng.toFixed(2)}]
								</span>
								<ThemeToggle />
							</div>
						</div>
					</div>
				</header>

				<main className="flex-1">
					{/* Hero Section */}
					<section className="border-b-2 border-foreground">
						<div className="grid grid-cols-1 lg:grid-cols-5 min-h-[50vh]">
							{/* Left: Typography */}
							<div className="lg:col-span-2 flex flex-col justify-between p-6 md:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground">
								{/* Top metadata */}
								<div className="flex items-center justify-between">
									<span
										className="text-[10px] text-muted-foreground tracking-[0.15em]"
										style={{ fontFamily: monoFont }}
									>
										{country.lat.toFixed(4)}N
									</span>
									<span
										className="text-[10px] tracking-[0.15em] uppercase"
										style={{
											fontFamily: monoFont,
											color: "#FF5D00",
										}}
									>
										[Country Archive]
									</span>
								</div>

								{/* Title */}
								<div className="py-8 b-slide">
									<div className="b-stamp inline-flex items-center gap-2 px-3 py-2 uppercase text-xs tracking-[0.2em] b-accent mb-6">
										<Globe className="h-3 w-3" />
										Nation
									</div>

									<h1 className="b-heading text-5xl md:text-7xl xl:text-8xl uppercase mb-4">
										{country.name}
									</h1>

									<p
										className="text-xs text-muted-foreground max-w-sm leading-relaxed"
										style={{ fontFamily: monoFont }}
									>
										{citiesSorted.length} cities logged
									</p>
								</div>

								{/* Bottom metadata */}
								<div className="flex items-center gap-6">
									<div
										className="text-[10px] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										<span className="block">
											{country.lng.toFixed(4)}E
										</span>
										<span className="block text-foreground">
											coords
										</span>
									</div>
									{citiesSorted.length > 0 &&
										citiesSorted[0].lastVistitedYear && (
											<div
												className="text-[10px] text-muted-foreground"
												style={{ fontFamily: monoFont }}
											>
												<span className="block">
													{citiesSorted[0].lastVistitedMonth}/
													{citiesSorted[0].lastVistitedYear}
												</span>
												<span className="block text-foreground">
													last visit
												</span>
											</div>
										)}
								</div>
							</div>

							{/* Right: Map of cities */}
							<div className="lg:col-span-3 relative overflow-hidden">
								{citiesSorted.length > 0 ? (
									<MapComponent
										center={[country.lng, country.lat]}
										zoom={5}
										maxZoom={12}
									>
										<MapControls
											position="bottom-right"
											showZoom
											showCompass
										/>
										<MapBoundsFitter cities={citiesSorted} />
										{citiesSorted.map((city) => (
											<MapMarker
												key={city._id}
												longitude={city.lng}
												latitude={city.lat}
											>
												<MarkerContent>
													<div className="group cursor-pointer transition-transform hover:scale-125">
														<div className="b-crosshair" />
													</div>
												</MarkerContent>
												<MarkerTooltip>
													<span
														className="text-[10px] font-bold uppercase tracking-[0.1em]"
														style={{
															fontFamily: monoFont,
														}}
													>
														{city.name}
													</span>
												</MarkerTooltip>
											</MapMarker>
										))}
									</MapComponent>
								) : (
									<div className="absolute inset-0 b-grid-bg flex items-center justify-center">
										<div className="text-center">
											<MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
											<span
												className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase"
												style={{ fontFamily: monoFont }}
											>
												no cities logged
											</span>
										</div>
									</div>
								)}
							</div>
						</div>
					</section>

					{/* Stats bar */}
					<div className="border-b-2 border-foreground overflow-x-auto">
						<div className="flex">
							<div className="flex-1 min-w-[140px] px-4 py-3 border-r-2 border-foreground flex items-center gap-3">
								<MapPin className="size-4 text-[#FF5D00] shrink-0" />
								<div>
									<div
										className="text-lg font-bold"
										style={{ fontFamily: displayFont }}
									>
										{citiesSorted.length}
									</div>
									<div
										className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										Cities
									</div>
								</div>
							</div>
							<div className="flex-1 min-w-[140px] px-4 py-3 border-r-2 border-foreground flex items-center gap-3">
								<Navigation className="size-4 text-[#FF5D00] shrink-0" />
								<div>
									<div
										className="text-lg font-bold"
										style={{ fontFamily: displayFont }}
									>
										{country.lat.toFixed(2)}
									</div>
									<div
										className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										Latitude
									</div>
								</div>
							</div>
							<div className="flex-1 min-w-[140px] px-4 py-3 border-r-2 border-foreground flex items-center gap-3">
								<Globe className="size-4 text-[#FF5D00] shrink-0" />
								<div>
									<div
										className="text-lg font-bold"
										style={{ fontFamily: displayFont }}
									>
										{country.lng.toFixed(2)}
									</div>
									<div
										className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground"
										style={{ fontFamily: monoFont }}
									>
										Longitude
									</div>
								</div>
							</div>
							{citiesSorted.length > 0 &&
								citiesSorted[0].lastVistitedYear && (
									<div className="flex-1 min-w-[140px] px-4 py-3 flex items-center gap-3">
										<Calendar className="size-4 text-[#FF5D00] shrink-0" />
										<div>
											<div
												className="text-lg font-bold"
												style={{ fontFamily: displayFont }}
											>
												{citiesSorted[0].lastVistitedMonth}/
												{citiesSorted[0].lastVistitedYear}
											</div>
											<div
												className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground"
												style={{ fontFamily: monoFont }}
											>
												Last Visit
											</div>
										</div>
									</div>
								)}
						</div>
					</div>

					{/* Cities Catalog Section */}
					<section className="border-b-2 border-foreground">
						{/* Section header */}
						<div className="border-b-2 border-foreground px-4 md:px-8 py-4 flex items-end justify-between">
							<div>
								<span
									className="text-[10px] text-muted-foreground block mb-1 tracking-[0.1em]"
									style={{ fontFamily: monoFont }}
								>
									// all destinations, indexed
								</span>
								<h2 className="b-heading text-3xl md:text-5xl uppercase">
									Cities
									<span style={{ color: "#FF5D00" }}>.</span>
								</h2>
							</div>
							<span
								className="text-[10px] text-muted-foreground tracking-[0.1em]"
								style={{ fontFamily: monoFont }}
							>
								[{citiesSorted.length} entries]
							</span>
						</div>

						{/* Cities grid */}
						<div className="px-4 md:px-8 py-8 b-grid-bg">
							{citiesSorted.length === 0 ? (
								<div className="py-16 text-center">
									<span
										className="text-[11px] text-muted-foreground tracking-[0.1em]"
										style={{ fontFamily: monoFont }}
									>
										// no cities logged yet
									</span>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
									{citiesSorted.map((city, i) => (
										<Link
											key={city._id}
											to="/country/$countryId/city/$cityId"
											params={{
												countryId: country._id,
												cityId: city._id,
											}}
											className="text-left border-2 border-foreground -mt-[2px] -ml-[2px] first:mt-0 p-5 hover:bg-[#FF5D00]/5 transition-colors group cursor-pointer relative block"
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
												{city.iconImage ? (
													<div className="w-20 h-20 shrink-0 border-2 border-foreground overflow-hidden">
														<img
															src={city.iconImage}
															alt={city.name}
															className="w-full h-full object-cover"
														/>
													</div>
												) : (
													<div className="w-20 h-20 shrink-0 border-2 border-foreground/20 flex items-center justify-center bg-muted/30">
														<MapPin className="size-6 text-muted-foreground" />
													</div>
												)}

												<div className="flex-1 min-w-0">
													<h3 className="b-heading text-2xl uppercase group-hover:text-[#FF5D00] transition-colors">
														{city.name}
													</h3>

													{city.lastVistitedYear && (
														<div className="flex items-center gap-2 mt-2">
															<span
																className="text-[9px] uppercase tracking-[0.15em] b-accent"
																style={{
																	fontFamily:
																		monoFont,
																}}
															>
																Last visited
															</span>
															<span
																className="text-[9px] tracking-[0.1em] text-muted-foreground"
																style={{
																	fontFamily:
																		monoFont,
																}}
															>
																{city.lastVistitedMonth}/
																{city.lastVistitedYear}
															</span>
														</div>
													)}
												</div>
											</div>

											{/* Bottom metadata */}
											<div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/10">
												<span
													className="text-[8px] text-muted-foreground tracking-[0.1em]"
													style={{ fontFamily: monoFont }}
												>
													{city.lat.toFixed(4)},{" "}
													{city.lng.toFixed(4)}
												</span>
												<span
													className="text-[9px] uppercase tracking-[0.1em] text-[#FF5D00] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
													style={{ fontFamily: monoFont }}
												>
													Explore
													<ArrowUpRight className="size-3" />
												</span>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</section>
				</main>

				{/* Footer */}
				<footer className="border-t-2 border-foreground">
					<div className="px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
						<span
							className="text-[10px] text-muted-foreground tracking-[0.1em]"
							style={{ fontFamily: monoFont }}
						>
							// {country.name} &mdash; country archive
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
									All Countries
								</Button>
							</Link>
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
					</div>
				</footer>
			</div>
		</>
	);
}

// ─── Map Bounds Fitter ───────────────────────────────────────────────────────

function MapBoundsFitter({
	cities,
}: {
	cities: Array<{ lng: number; lat: number }>;
}) {
	const { map, isLoaded } = useMap();

	// biome-ignore lint/correctness/useExhaustiveDependencies: fit bounds once on load
	useEffect(() => {
		if (!map || !isLoaded || cities.length === 0) return;

		if (cities.length === 1) {
			map.flyTo({
				center: [cities[0].lng, cities[0].lat],
				zoom: 10,
				duration: 800,
			});
			return;
		}

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
		);

		map.fitBounds(
			[
				[bounds.minLng, bounds.minLat],
				[bounds.maxLng, bounds.maxLat],
			],
			{ padding: 60, duration: 800 },
		);
	}, [map, isLoaded]);

	return null;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const countryPageStyles = `
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
