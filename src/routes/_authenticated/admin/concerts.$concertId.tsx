import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ConcertImageTable } from "@/components/admin/ConcertImageTable";
import type { AdminPageContext } from "../admin";
import { getConvexHttpClient } from "@/lib/convex-http";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/_authenticated/admin/concerts/$concertId",
)({
	beforeLoad: async ({ params }) => {
		const client = getConvexHttpClient();
		const concert = await client.query(api.functions.concert.getOne, {
			id: params.concertId as Id<"concert">,
		});
		const place = concert
			? await client.query(api.functions.place.getOne, {
					id: concert.placeId as Id<"place">,
				})
			: null;

		return {
			adminPage: {
				title: concert?.title ?? "Concert",
				breadcrumbs: [
					{ label: "Concerts", to: "/admin/concerts" },
					{ label: concert?.title ?? "Concert" },
				],
			} satisfies AdminPageContext,
			concertMeta: {
				venue: place?.name ?? "Unknown venue",
			},
		};
	},
	component: AdminConcertImagesPage,
});

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
	return `Interval — ${trimmed}`;
};

function AdminConcertImagesPage() {
	const { concertId } = Route.useParams();
	const concert = useQuery(api.functions.concert.getOne, {
		id: concertId as Id<"concert">,
	});
	const place = useQuery(
		api.functions.place.getOne,
		concert ? { id: concert.placeId as Id<"place"> } : "skip",
	);

	if (concert === undefined) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	if (concert === null) {
		return (
			<div className="text-center py-16">
				<h2 className="text-xl font-semibold text-destructive">
					Concert not found
				</h2>
				<p className="text-muted-foreground mt-2">
					The concert you are looking for doesn't exist.
				</p>
			</div>
		);
	}

	const normalizedSetlist = concert.setlist.map(normalizeSetlistItem);
	let pieceCounter = 0;

	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6 space-y-4">
				<div>
					<p className="text-sm text-muted-foreground">Venue</p>
					<p className="text-lg font-semibold">
						{place?.name ?? "Unknown venue"}
					</p>
				</div>
				{concert.dateTime && (
					<div>
						<p className="text-sm text-muted-foreground">Date</p>
						<p className="text-sm">
							{new Date(concert.dateTime).toLocaleString()}
						</p>
					</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p className="text-sm text-muted-foreground">Performers</p>
						<ul className="text-sm list-disc list-inside">
							{concert.performers.map((performer) => (
								<li key={performer}>{performer}</li>
							))}
						</ul>
						{concert.supportingPerformers &&
							concert.supportingPerformers.length > 0 && (
								<div className="mt-4">
									<p className="text-sm text-muted-foreground">
										Supporting Performers
									</p>
									<ul className="text-sm list-disc list-inside">
										{concert.supportingPerformers.map((supporting) => (
											<li key={supporting}>{supporting}</li>
										))}
									</ul>
								</div>
							)}
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Setlist</p>
						<ul className="text-sm space-y-1">
							{normalizedSetlist.map((item, index) => {
								if (item.type === "section") {
									return (
										<li
											key={`${item.type}-${index}`}
											className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
										>
											{item.title}
										</li>
									);
								}
								if (item.type === "interval") {
									return (
										<li
											key={`${item.type}-${index}`}
											className="text-xs text-muted-foreground"
										>
											{formatIntervalLabel(item.title)}
										</li>
									);
								}
								pieceCounter += 1;
								const pieceNumber = String(pieceCounter).padStart(2, "0");
								return (
									<li key={`${item.type}-${index}`}>
										<span className="text-muted-foreground mr-2">
											{pieceNumber}.
										</span>
										{item.title}
									</li>
								);
							})}
						</ul>
					</div>
				</div>
				{concert.notes && (
					<div>
						<p className="text-sm text-muted-foreground">Notes</p>
						<p className="text-sm">{concert.notes}</p>
					</div>
				)}
			</div>
			<div className="rounded-lg border bg-card p-6">
				<ConcertImageTable
					concertId={concertId as Id<"concert">}
					featuredImageId={concert.featuredImageId}
				/>
			</div>
		</div>
	);
}
