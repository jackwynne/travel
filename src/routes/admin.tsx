import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	const { user, isLoading, signIn } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4">
				<h1 className="text-2xl font-bold">Admin Access Required</h1>
				<p className="text-muted-foreground">
					Please sign in to access the admin panel.
				</p>
				<Button onClick={() => signIn()}>Sign In</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4">
				<Outlet />
			</div>
		</div>
	);
}
