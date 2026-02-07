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
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Setlist</p>
						<ul className="text-sm list-disc list-inside">
							{concert.setlist.map((piece) => (
								<li key={piece}>{piece}</li>
							))}
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
