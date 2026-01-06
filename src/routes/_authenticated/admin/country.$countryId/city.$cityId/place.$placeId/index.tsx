import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ImageTable } from "@/components/admin/ImageTable";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import type { AdminPageContext } from "../../../../admin";
import { getConvexHttpClient } from "@/lib/convex-http";

export const Route = createFileRoute(
	"/_authenticated/admin/country/$countryId/city/$cityId/place/$placeId/",
)({
	beforeLoad: async ({ params }) => {
		const client = getConvexHttpClient();
		const [country, city, place] = await Promise.all([
			client.query(api.functions.country.getOne, {
				id: params.countryId as Id<"country">,
			}),
			client.query(api.functions.city.getOne, {
				id: params.cityId as Id<"city">,
			}),
			client.query(api.functions.place.getOne, {
				id: params.placeId as Id<"place">,
			}),
		]);

		return {
			adminPage: {
				title: place?.name ?? "Place",
				breadcrumbs: [
					{ label: "Countries", to: "/admin/countries" },
					{
						label: country?.name ?? "Country",
						to: "/admin/country/$countryId",
						params: { countryId: params.countryId },
					},
					{
						label: city?.name ?? "City",
						to: "/admin/country/$countryId/city/$cityId",
						params: { countryId: params.countryId, cityId: params.cityId },
					},
					{ label: place?.name ?? "Place" },
				],
			} satisfies AdminPageContext,
		};
	},
	component: AdminPlaceImagesPage,
});

function AdminPlaceImagesPage() {
	const { countryId, cityId, placeId } = Route.useParams();

	const country = useQuery(api.functions.country.getOne, {
		id: countryId as Id<"country">,
	});
	const city = useQuery(api.functions.city.getOne, {
		id: cityId as Id<"city">,
	});
	const place = useQuery(api.functions.place.getOne, {
		id: placeId as Id<"place">,
	});

	if (!country || !city || !place) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card p-6">
			<ImageTable placeId={placeId as Id<"place">} />
		</div>
	);
}
