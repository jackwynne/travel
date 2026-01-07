import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { CityImageTable } from "@/components/admin/CityImageTable";
import { PlaceTable } from "@/components/admin/PlaceTable";
import { RouteTable } from "@/components/admin/RouteTable";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import type { AdminPageContext } from "../../../admin";
import { getConvexHttpClient } from "@/lib/convex-http";

export const Route = createFileRoute("/_authenticated/admin/country/$countryId/city/$cityId/")(
	{
		beforeLoad: async ({ params }) => {
			const client = getConvexHttpClient();
			const [country, city] = await Promise.all([
				client.query(api.functions.country.getOne, {
					id: params.countryId as Id<"country">,
				}),
				client.query(api.functions.city.getOne, {
					id: params.cityId as Id<"city">,
				}),
			]);

			return {
				adminPage: {
					title: city?.name ?? "City",
					breadcrumbs: [
						{ label: "Countries", to: "/admin/countries" },
						{
							label: country?.name ?? "Country",
							to: "/admin/country/$countryId",
							params: { countryId: params.countryId },
						},
						{ label: city?.name ?? "City" },
					],
				} satisfies AdminPageContext,
			};
		},
		component: AdminPlacesPage,
	},
);

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
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<CityImageTable cityId={cityId as Id<"city">} />
			</div>
			<div className="rounded-lg border bg-card p-6">
				<PlaceTable cityId={cityId as Id<"city">} countryId={countryId} />
			</div>
			<div className="rounded-lg border bg-card p-6">
				<RouteTable cityId={cityId as Id<"city">} />
			</div>
		</div>
	);
}
