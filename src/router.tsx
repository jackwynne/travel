import { ConvexQueryClient } from "@convex-dev/react-query";
import {
	MutationCache,
	notifyManager,
	QueryClient,
} from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { toast } from "sonner";
import NotFound from "./components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
	if (!CONVEX_URL) {
		throw new Error("missing VITE_CONVEX_URL envar");
	}
	const convex = new ConvexReactClient(CONVEX_URL, {
		unsavedChangesWarning: false,
	});
	const convexQueryClient = new ConvexQueryClient(convex);

	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				queryKeyHashFn: convexQueryClient.hashFn(),
				queryFn: convexQueryClient.queryFn(),
			},
		},
		mutationCache: new MutationCache({
			onError: (error) => {
				toast(error.message, { className: "bg-red-500 text-white" });
			},
		}),
	});
	convexQueryClient.connect(queryClient);

	const router = createRouter({
		routeTree,
		defaultPreload: "intent",
		defaultNotFoundComponent: () => <NotFound />,
		context: { queryClient, convexClient: convex, convexQueryClient },
		Wrap: ({ children }) => (
			<ConvexProvider client={convexQueryClient.convexClient}>
				{children}
			</ConvexProvider>
		),
		scrollRestoration: true,
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
