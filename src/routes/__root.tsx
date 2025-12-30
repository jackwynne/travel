import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { ThemeProvider } from "@/hooks/theme-provider";
import ClientDevtools from "../components/ClientDevtools";
import ConvexProvider from "../integrations/convex/provider";
import WorkOSProvider from "../integrations/workos/provider";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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

	component: RootComponent,
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
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<WorkOSProvider>
					<ConvexProvider>
						{/* <Header /> */}
						{children}
						<ClientDevtools />
					</ConvexProvider>
				</WorkOSProvider>
				<Scripts />
			</body>
		</html>
	);
}
