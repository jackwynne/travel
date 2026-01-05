import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/_authenticated/admin/country/$countryId/city/$cityId/place/$placeId",
)({
	component: PlaceLayout,
});

function PlaceLayout() {
	const { placeId } = Route.useParams();
	const place = useQuery(api.functions.place.getOne, {
		id: placeId as Id<"place">,
	});

	if (place === undefined) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	if (place === null) {
		return (
			<div className="text-center py-16">
				<h2 className="text-xl font-semibold text-destructive">
					Place not found
				</h2>
				<p className="text-muted-foreground mt-2">
					The place you're looking for doesn't exist.
				</p>
			</div>
		);
	}

	return <Outlet />;
}
