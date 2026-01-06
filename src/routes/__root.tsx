import { ClerkProvider } from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { ConvexReactClient } from "convex/react";
import DefaultCatchBoundary from "@/components/default-catch-boundary";
import { ThemeProvider } from "@/hooks/theme-provider";
import ClientDevtools from "../components/ClientDevtools";
import appCss from "../styles.css?url";

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
	const authObject = await auth();
	const token = authObject.getToken({ template: "convex" });

	return {
		userId: authObject.userId,
		token,
	};
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
		scripts: [
			{
				children: `
					(function() {
						const stored = localStorage.getItem('ui-theme');
						const theme = stored === 'dark' || stored === 'light' 
							? stored 
							: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
						document.documentElement.classList.add(theme);
					})();
				`,
			},
		],
	}),
	beforeLoad: async (ctx) => {
		const auth = await fetchClerkAuth();
		const { userId, token } = auth;

		const tokenValue = await token;
		console.log("tokenValue", tokenValue);

		// During SSR only (the only time serverHttpClient exists),
		// set the Clerk auth token to make HTTP queries with.
		if (tokenValue) {
			ctx.context.convexQueryClient.serverHttpClient?.setAuth(tokenValue);
		}

		return {
			userId,
			tokenValue,
		};
	},
	component: RootComponent,
	errorComponent: DefaultCatchBoundary,
	shellComponent: RootDocument,
});

function RootComponent() {
	return (
		<ThemeProvider>
			<Outlet />
		</ThemeProvider>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<head>
					<HeadContent />
				</head>
				<body>
					{/* <Header /> */}
					{children}
					<ClientDevtools />
					<Scripts />
				</body>
			</html>
		</ClerkProvider>
	);
}
