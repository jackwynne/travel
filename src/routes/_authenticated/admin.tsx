import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
	component: AdminLayout,
});

function AdminLayout() {

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4">
				<Outlet />
			</div>
		</div>
	)
}
