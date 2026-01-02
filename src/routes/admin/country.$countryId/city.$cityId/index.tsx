import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { PlaceTable } from "@/components/admin/PlaceTable";

export const Route = createFileRoute("/admin/country/$countryId/city/$cityId/")({
	component: AdminPlacesPage,
});

function AdminPlacesPage() {
	const { countryId, cityId } = Route.useParams();

	const country = useQuery(api.functions.country.getOne, {
		id: countryId as Id<"country">,
	});
	const city = useQuery(api.functions.city.getOne, {
		id: cityId as Id<"city">,
	});

	if (!country || !city) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<AdminBreadcrumb
				items={[
					{
						label: "Countries",
						to: "/admin",
					},
					{
						label: country.name,
						to: "/admin/country/$countryId",
						params: { countryId },
					},
					{
						label: city.name,
					},
				]}
			/>
			<div className="rounded-lg border bg-card p-6">
				<PlaceTable cityId={cityId as Id<"city">} />
			</div>
		</div>
	);
}

