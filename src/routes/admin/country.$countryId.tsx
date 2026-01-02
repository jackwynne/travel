import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/admin/country/$countryId")({
	component: CountryLayout,
});

function CountryLayout() {
	const { countryId } = Route.useParams();
	const country = useQuery(api.functions.country.getOne, {
		id: countryId as Id<"country">,
	});

	if (country === undefined) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	if (country === null) {
		return (
			<div className="text-center py-16">
				<h2 className="text-xl font-semibold text-destructive">Country not found</h2>
				<p className="text-muted-foreground mt-2">
					The country you're looking for doesn't exist.
				</p>
			</div>
		);
	}

	return <Outlet />;
}

