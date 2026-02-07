import { createFileRoute, Outlet } from "@tanstack/react-router";
import type { AdminPageContext } from "../admin";
import { ConcertTable } from "@/components/admin/ConcertTable";

export const Route = createFileRoute("/_authenticated/admin/concerts")({
	beforeLoad: () => {
		return {
			adminPage: {
				title: "Concerts",
				breadcrumbs: [{ label: "Concerts" }],
			} satisfies AdminPageContext,
		};
	},
	component: AdminConcertsPage,
});

function AdminConcertsPage() {
	return (
		<div className="space-y-6">
			<p className="text-muted-foreground">
				Create, edit, and curate your concert archive. Link each performance
				to a venue and manage the setlist details.
			</p>
			<div className="rounded-lg border bg-card p-6">
				<ConcertTable />
			</div>
			<Outlet />
		</div>
	);
}
