import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { CityTable } from "@/components/admin/CityTable";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/_authenticated/admin/country/$countryId/",
)({
	component: AdminCitiesPage,
});

function AdminCitiesPage() {
	const { countryId } = Route.useParams();
	const country = useQuery(api.functions.country.getOne, {
		id: countryId as Id<"country">,
	});

	if (!country) {
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
					},
				]}
			/>
			<div className="rounded-lg border bg-card p-6">
				<CityTable countryId={countryId as Id<"country">} />
			</div>
		</div>
	);
}
