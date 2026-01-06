import { createFileRoute } from "@tanstack/react-router";

import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { CountryTable } from "@/components/admin/CountryTable";

export const Route = createFileRoute("/_authenticated/admin/countries")({
	component: AdminCountriesPage,
});

function AdminCountriesPage() {
	return (
		<div>
			<AdminBreadcrumb items={[{ label: "Countries" }]} />
			<div className="rounded-lg border bg-card p-6">
				<CountryTable />
			</div>
		</div>
	);
}

