import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { ImageTable } from "@/components/admin/ImageTable";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

export const Route = createFileRoute(
	"/_authenticated/admin/country/$countryId/city/$cityId/place/$placeId/",
)({
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
						to: "/admin/country/$countryId/city/$cityId",
						params: { countryId, cityId },
					},
					{
						label: place.name,
					},
				]}
			/>
			<div className="rounded-lg border bg-card p-6">
				<ImageTable placeId={placeId as Id<"place">} />
			</div>
		</div>
	);
}
