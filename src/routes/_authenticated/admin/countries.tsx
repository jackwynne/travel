import { createFileRoute } from "@tanstack/react-router";
import type { AdminPageContext } from "../admin";

import { CountryTable } from "@/components/admin/CountryTable";

export const Route = createFileRoute("/_authenticated/admin/countries")({
	beforeLoad: () => {
		return {
			adminPage: {
				title: "Countries",
				breadcrumbs: [{ label: "Countries" }],
			} satisfies AdminPageContext,
		};
	},
	component: AdminCountriesPage,
});

function AdminCountriesPage() {
	return (
		<div className="rounded-lg border bg-card p-6">
			<CountryTable />
		</div>
	);
}
