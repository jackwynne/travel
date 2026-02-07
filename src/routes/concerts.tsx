import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { ArrowUpRight, CalendarDays, Music, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/concerts")({
	component: ConcertsPage,
});

const monoFont = "'Space Mono', 'Courier New', monospace";
const displayFont = "'Instrument Serif', 'Georgia', serif";

type SetlistItem =
	| string
	| {
			type: "piece" | "section" | "interval";
			title: string;
	  };

const setlistTypeMap: Record<string, "piece" | "section" | "interval"> = {
	piece: "piece",
	song: "piece",
	track: "piece",
	section: "section",
	act: "section",
	scene: "section",
	part: "section",
	finale: "section",
	encore: "section",
	interval: "interval",
	intermission: "interval",
	break: "interval",
};

const normalizeSetlistItem = (item: SetlistItem) => {
	if (typeof item !== "string") {
		return item;
	}

	const trimmed = item.trim();
	const prefixMatch = /^([A-Za-z]+)\s*:\s*(.*)$/.exec(trimmed);
	if (prefixMatch) {
		const prefix = prefixMatch[1].toLowerCase();
		const mappedType = setlistTypeMap[prefix];
		if (mappedType) {
			const rawTitle = prefixMatch[2].trim();
			let title = rawTitle || prefixMatch[1];
			if (
				mappedType === "section" &&
				rawTitle &&
				["act", "scene", "part", "finale", "encore"].includes(prefix)
			) {
				title = new RegExp(`^${prefix}\\b`, "i").test(rawTitle)
					? rawTitle
					: `${prefixMatch[1]} ${rawTitle}`;
			}
			return { type: mappedType, title };
		}
	}

	if (/^(interval|intermission|break)$/i.test(trimmed)) {
		return { type: "interval" as const, title: trimmed };
	}

	if (/^(act|scene|part|finale|encore)\b/i.test(trimmed)) {
		return { type: "section" as const, title: trimmed };
	}

	return { type: "piece" as const, title: item };
};

const formatIntervalLabel = (title: string) => {
	const trimmed = title.trim();
	if (!trimmed) return "Interval";
	if (/^(interval|intermission|break)$/i.test(trimmed)) return trimmed;
	return `Interval · ${trimmed}`;
};

function ConcertsPage() {
	const concerts = useQuery(api.functions.concert.getGallery);

	const totalImages = useMemo(() => {
		if (!concerts) return 0;
		return concerts.reduce((sum, concert) => sum + concert.imageCount, 0);
	}, [concerts]);

	const performersTicker = useMemo(() => {
		if (!concerts) return [];
		const names = new Set<string>();
		for (const concert of concerts) {
			for (const performer of concert.performers) {
				if (performer.trim().length > 0) {
					names.add(performer.trim());
				}
			}
		}
		return Array.from(names).slice(0, 24);
	}, [concerts]);

	if (concerts === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap');

				:root {
					--c-accent: oklch(0.58 0.22 27);
					--c-accent-soft: oklch(0.58 0.22 27 / 14%);
					--c-border: oklch(0.15 0 0);
					--c-stage-base: oklch(0.975 0.005 70);
					--c-punch: oklch(0.975 0.005 70);
					--c-grid-line: oklch(0.15 0 0 / 5%);
					--c-scan-line: oklch(0.15 0 0 / 3%);
					--c-ticker-bg: oklch(0.11 0 0);
					--c-ticker-fg: oklch(0.82 0 0);
				}

				.dark {
					--c-accent: oklch(0.72 0.19 25);
					--c-accent-soft: oklch(0.72 0.19 25 / 10%);
					--c-border: oklch(1 0 0 / 14%);
					--c-stage-base: oklch(0.155 0 0);
					--c-punch: oklch(0.155 0 0);
					--c-grid-line: oklch(1 0 0 / 4%);
					--c-scan-line: oklch(1 0 0 / 3%);
					--c-ticker-bg: oklch(0.09 0 0);
					--c-ticker-fg: oklch(0.50 0 0);
				}

				.c-heading {
					font-family: ${displayFont};
					letter-spacing: -0.03em;
					line-height: 0.9;
				}

				.c-mono {
					font-family: ${monoFont};
				}

				.c-stage {
					background:
						radial-gradient(circle at 20% 20%, var(--c-accent-soft), transparent 50%),
						radial-gradient(circle at 85% 5%, oklch(0.5 0.05 260 / 6%), transparent 40%),
						var(--c-stage-base);
				}

				.c-grid {
					background-image:
						linear-gradient(90deg, var(--c-grid-line) 1px, transparent 1px),
						linear-gradient(0deg, var(--c-grid-line) 1px, transparent 1px);
					background-size: 26px 26px;
				}

				.c-ticker {
					animation: cTicker 40s linear infinite;
				}

				@keyframes cTicker {
					from { transform: translateX(0); }
					to { transform: translateX(-50%); }
				}

				.c-rise {
					opacity: 0;
					transform: translateY(24px);
					animation: cRise 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}

				@keyframes cRise {
					to { opacity: 1; transform: translateY(0); }
				}

				.c-scanlines {
					background: repeating-linear-gradient(180deg, var(--c-scan-line) 0 1px, transparent 1px 4px);
				}

				.c-ticket {
					border: 2px solid var(--c-border);
					border-radius: 18px;
					position: relative;
					overflow: hidden;
				}

				.c-ticket::before,
				.c-ticket::after {
					content: "";
					position: absolute;
					top: 50%;
					width: 32px;
					height: 32px;
					background: var(--c-punch);
					border: 2px solid var(--c-border);
					border-radius: 999px;
					transform: translateY(-50%);
				}

				.c-ticket::before {
					left: -18px;
				}

				.c-ticket::after {
					right: -18px;
				}

				.c-glow {
					box-shadow: 0 12px 32px oklch(0 0 0 / 8%), 0 2px 6px oklch(0 0 0 / 4%);
				}

				.dark .c-glow {
					box-shadow: 0 12px 32px oklch(0 0 0 / 40%), 0 2px 6px oklch(0 0 0 / 20%);
				}

				.c-accent {
					color: var(--c-accent);
				}

				.c-ink {
					border-color: var(--c-border);
				}

				.c-ticker-bar {
					background: var(--c-ticker-bg);
					color: var(--c-ticker-fg);
					border-bottom: 2px solid var(--c-border);
				}

				.c-marquee {
					animation: cMarquee 30s linear infinite;
				}

				@keyframes cMarquee {
					from { transform: translateX(0); }
					to { transform: translateX(-50%); }
				}
			`}</style>

			<div className="c-ticker-bar overflow-hidden">
				<div className="c-ticker flex whitespace-nowrap">
					{[...Array(3)].map((_, index) => (
						<span
							key={index}
							className="text-[10px] tracking-[0.25em] uppercase px-8"
							style={{ fontFamily: monoFont }}
						>
							Concert Archive · Live Sets · Performance Notes · Photographic Proof ·
						</span>
					))}
				</div>
			</div>

			<header className="sticky top-0 z-50 border-b-2 c-ink bg-background/90 backdrop-blur">
				<div className="px-4 md:px-8">
					<div className="h-12 flex items-center justify-between">
						<Link to="/" className="flex items-center gap-3">
							<span
								className="text-[11px] font-bold tracking-[0.4em] uppercase"
								style={{ fontFamily: monoFont }}
							>
								TRAVEL
							</span>
							<Music className="h-4 w-4 c-accent" />
						</Link>
						<div className="flex items-center gap-4">
							<Link
								to="/admin"
								className="text-[10px] tracking-[0.2em] uppercase c-accent"
								style={{ fontFamily: monoFont }}
							>
								Admin
							</Link>
							<ThemeToggle />
						</div>
					</div>
				</div>
			</header>

			<main className="c-stage">
				<section className="border-b-2 c-ink c-grid">
					<div className="px-4 md:px-8 py-12 md:py-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase c-accent c-mono">
								<CalendarDays className="h-4 w-4" />
								Live Archive
							</div>
							<h1 className="c-heading text-5xl md:text-7xl lg:text-8xl">
								Concert Log
							</h1>
							<p
								className="text-sm md:text-base text-muted-foreground max-w-xl"
								style={{ fontFamily: monoFont }}
							>
								A living playbill of the performances, programs, and stage nights
								captured on the road. Each entry carries the venue, the players, and
								the photographs that prove it happened.
							</p>
							<div className="flex flex-wrap gap-4">
								<div className="c-ticket bg-background/80 px-6 py-4 c-glow">
									<p className="text-[10px] uppercase tracking-[0.3em] c-mono text-muted-foreground">
										Concerts
									</p>
									<p className="text-2xl font-semibold">{concerts.length}</p>
								</div>
								<div className="c-ticket bg-background/80 px-6 py-4 c-glow">
									<p className="text-[10px] uppercase tracking-[0.3em] c-mono text-muted-foreground">
										Images
									</p>
									<p className="text-2xl font-semibold">{totalImages}</p>
								</div>
								<div className="c-ticket bg-background/80 px-6 py-4 c-glow">
									<p className="text-[10px] uppercase tracking-[0.3em] c-mono text-muted-foreground">
										Performers
									</p>
									<p className="text-2xl font-semibold">
										{performersTicker.length}
									</p>
								</div>
							</div>
						</div>
						<div className="c-ticket bg-background/80 p-6 c-scanlines">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold">Now Playing</h2>
								<span
									className="text-[10px] tracking-[0.2em] uppercase c-accent"
									style={{ fontFamily: monoFont }}
								>
									Live Roll
								</span>
							</div>
							<div className="overflow-hidden border-2 c-ink">
								<div className="c-marquee flex whitespace-nowrap">
									{[...Array(2)].map((_, index) => (
										<div key={index} className="flex">
											{performersTicker.length === 0 ? (
												<span
													className="px-6 py-2 text-[11px] uppercase tracking-[0.2em]"
													style={{ fontFamily: monoFont }}
												>
													Add performers to populate the live roll
												</span>
											) : (
												performersTicker.map((performer) => (
													<span
														key={`${index}-${performer}`}
														className="px-6 py-2 text-[11px] uppercase tracking-[0.2em]"
														style={{ fontFamily: monoFont }}
													>
														{performer}
													</span>
												))
											)}
										</div>
									))}
								</div>
							</div>
							<p className="text-xs text-muted-foreground mt-4 c-mono">
								A running ribbon of names and ensembles.
							</p>
						</div>
					</div>
				</section>

				<section className="px-4 md:px-8 py-12 md:py-16 space-y-8">
					{concerts.length === 0 ? (
						<div className="border-2 c-ink p-10 text-center">
							<h2 className="c-heading text-4xl md:text-6xl text-muted-foreground/40">
								No concerts yet
							</h2>
							<p
								className="text-xs text-muted-foreground mt-4"
								style={{ fontFamily: monoFont }}
							>
								Add concerts in the admin panel to populate this archive.
							</p>
							<Link to="/admin" className="inline-flex items-center gap-2 mt-6">
								<span
									className="text-[10px] uppercase tracking-[0.2em] c-accent"
									style={{ fontFamily: monoFont }}
								>
									Open Admin
								</span>
								<ArrowUpRight className="h-3.5 w-3.5 c-accent" />
							</Link>
						</div>
					) : (
						concerts.map((concert, index) => {
							const images = concert.images.slice(0, 6);
							const extraImages = concert.images.length - images.length;
							const cityLine =
								concert.cityName && concert.cityName !== "Unknown city"
									? concert.cityName
									: "";
							const setlistItems = concert.setlist.map(normalizeSetlistItem);
							let pieceCounter = 0;

							return (
								<div
									key={concert._id}
									className={cn("c-ticket bg-background/80 c-glow c-rise", "p-6")}
									style={{ animationDelay: `${index * 0.08}s` }}
								>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 c-ink pb-4 mb-6">
										<div>
											<p
												className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
												style={{ fontFamily: monoFont }}
											>
												{concert.dateTime
													? new Date(concert.dateTime).toLocaleDateString()
													: "Date TBD"}
											</p>
											<h2 className="c-heading text-3xl md:text-4xl">
												{concert.title}
											</h2>
											<p className="text-sm text-muted-foreground">
												{concert.placeName}
												{cityLine ? ` · ${cityLine}` : ""}
											</p>
										</div>
										<div className="flex items-center gap-3">
											<span
												className="text-[10px] uppercase tracking-[0.2em] c-accent"
												style={{ fontFamily: monoFont }}
											>
												{concert.imageCount} images
											</span>
											{concert.countryId && concert.cityId && (
												<Link
													to="/country/$countryId/city/$cityId"
													params={{
														countryId: concert.countryId,
														cityId: concert.cityId,
													}}
													className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] c-accent"
													style={{ fontFamily: monoFont }}
												>
													Explore city
													<ArrowUpRight className="h-3.5 w-3.5" />
												</Link>
											)}
										</div>
									</div>

									<div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
										<div className="space-y-6">
											<div>
												<h3
													className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
													style={{ fontFamily: monoFont }}
												>
													Performers
												</h3>
												<div className="flex flex-wrap gap-2 mt-3">
													{concert.performers.map((performer) => (
														<span
															key={`${concert._id}-performer-${performer}`}
															className="px-3 py-1 border-2 c-ink text-xs uppercase tracking-[0.15em]"
															style={{ fontFamily: monoFont }}
														>
															{performer}
														</span>
													))}
												</div>
											</div>

											{concert.supportingPerformers &&
												concert.supportingPerformers.length > 0 && (
													<div>
														<h3
															className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
															style={{ fontFamily: monoFont }}
														>
															Supporting Crew
														</h3>
														<div className="flex flex-wrap gap-2 mt-3">
															{concert.supportingPerformers.map(
																(supporting) => (
																	<span
																		key={`${concert._id}-supporting-${supporting}`}
																		className="px-3 py-1 border-2 border-dashed c-ink text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
																		style={{ fontFamily: monoFont }}
																	>
																		{supporting}
																	</span>
																),
															)}
														</div>
													</div>
												)}

											<div>
												<h3
													className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
													style={{ fontFamily: monoFont }}
												>
													Setlist / Program
												</h3>
												<div className="mt-3 space-y-2">
													{setlistItems.map((item, itemIndex) => {
														if (item.type === "section") {
															return (
																<div
																	key={`${concert._id}-section-${itemIndex}`}
																	className="pt-3 mt-2 border-t c-ink"
																>
																	<span
																		className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
																		style={{ fontFamily: monoFont }}
																	>
																		{item.title}
																	</span>
																</div>
															);
														}

														if (item.type === "interval") {
															return (
																<div
																	key={`${concert._id}-interval-${itemIndex}`}
																	className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
																	style={{ fontFamily: monoFont }}
																>
																	<span className="h-px flex-1 bg-[var(--c-border)]/30" />
																	<span>{formatIntervalLabel(item.title)}</span>
																	<span className="h-px flex-1 bg-[var(--c-border)]/30" />
																</div>
															);
														}

														pieceCounter += 1;
														return (
															<div
																key={`${concert._id}-piece-${itemIndex}`}
																className="flex items-start gap-3"
															>
																<span
																	className="text-[10px] text-muted-foreground"
																	style={{ fontFamily: monoFont }}
																>
																	{String(pieceCounter).padStart(2, "0")}
																</span>
																<span className="text-sm">{item.title}</span>
															</div>
														);
													})}
												</div>
											</div>
										</div>

										<div>
											<div className="grid grid-cols-2 gap-3">
												{images.length === 0 ? (
													<div className="col-span-2 border-2 border-dashed c-ink p-6 text-center" style={{ opacity: 0.5 }}>
														<p
															className="text-xs text-muted-foreground"
															style={{ fontFamily: monoFont }}
														>
															No concert images yet
														</p>
													</div>
												) : (
													images.map((image, imageIndex) => (
														<div
															key={image._id}
															className="relative overflow-hidden border-2 c-ink c-glow"
														>
															<img
																src={image.iconImage || image.url || ""}
																alt={image.description || "Concert image"}
																className="h-28 w-full object-cover"
															/>
															{extraImages > 0 && imageIndex === images.length - 1 && (
																<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
																	<span
																		className="text-sm text-white tracking-[0.2em]"
																		style={{ fontFamily: monoFont }}
																	>
																		+{extraImages} more
																	</span>
																</div>
															)}
														</div>
													))
												)}
											</div>
											{concert.notes && (
												<p
													className="text-xs text-muted-foreground mt-4"
													style={{ fontFamily: monoFont }}
												>
													{concert.notes}
												</p>
											)}
										</div>
									</div>
								</div>
							);
						})
					)}
				</section>
			</main>

			<footer className="border-t-2 c-ink bg-background">
				<div className="px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<span
						className="text-[10px] text-muted-foreground tracking-[0.1em]"
						style={{ fontFamily: monoFont }}
					>
						// captured in the dark, cataloged in the light
					</span>
					<Link to="/admin">
						<button
							className="inline-flex items-center gap-2 rounded-none border-2 c-ink px-3 py-2 text-[10px] tracking-[0.15em] uppercase hover:bg-[var(--c-accent)] hover:text-white hover:border-[var(--c-accent)] transition-colors"
							style={{ fontFamily: monoFont }}
						>
							<Settings className="h-3 w-3" />
							Admin
						</button>
					</Link>
				</div>
			</footer>
		</div>
	);
}
