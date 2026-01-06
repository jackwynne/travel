import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { CityTable } from "@/components/admin/CityTable";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { AdminPageContext } from "../../admin";
import { getConvexHttpClient } from "@/lib/convex-http";

export const Route = createFileRoute("/_authenticated/admin/country/$countryId/")({
	beforeLoad: async ({ params }) => {
		const client = getConvexHttpClient();
		const country = await client.query(api.functions.country.getOne, {
			id: params.countryId as Id<"country">,
		});

		return {
			adminPage: {
				title: country?.name ?? "Country",
				breadcrumbs: [
					{ label: "Countries", to: "/admin/countries" },
					{ label: country?.name ?? "Country" },
				],
			} satisfies AdminPageContext,
		};
	},
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
		<div className="rounded-lg border bg-card p-6">
			<CityTable countryId={countryId as Id<"country">} />
		</div>
	);
}
