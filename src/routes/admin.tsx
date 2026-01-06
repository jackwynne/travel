import { SignIn, useAuth } from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import {
	createFileRoute,
	Outlet,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
	const { isAuthenticated, userId } = await auth();
	return { isAuthenticated, userId };
});

export const Route = createFileRoute("/admin")({
	component: AdminLayout,
	beforeLoad: async () => {
		const { isAuthenticated, userId } = await authStateFn();
		if (!isAuthenticated) {
			console.log("Not authenticated");
			throw redirect({
				to: "/sign-in",
				// Optionally store the intended destination
				search: { redirect: "/admin" },
			});
		}
		return { userId };
	},
	loader: async ({ context }) => {
		return { userId: context.userId };
	},
});

function AdminLayout() {
	const context = useRouteContext({ from: "__root__" });

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto py-8 px-4">
				<Outlet />
				<ConvexProviderWithClerk
					client={context.convexClient}
					useAuth={useAuth}
				>
					<Outlet />
				</ConvexProviderWithClerk>
			</div>
		</div>
	);
}
