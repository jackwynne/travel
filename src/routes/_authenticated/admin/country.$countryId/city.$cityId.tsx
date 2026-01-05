import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/_authenticated/admin/country/$countryId/city/$cityId",
)({
	component: CityLayout,
});

function CityLayout() {
	const { cityId } = Route.useParams();
	const city = useQuery(api.functions.city.getOne, {
		id: cityId as Id<"city">,
	});

	if (city === undefined) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	if (city === null) {
		return (
			<div className="text-center py-16">
				<h2 className="text-xl font-semibold text-destructive">
					City not found
				</h2>
				<p className="text-muted-foreground mt-2">
					The city you're looking for doesn't exist.
				</p>
			</div>
		);
	}

	return <Outlet />;
}
