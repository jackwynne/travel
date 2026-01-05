import { Box, Button, Card, Container, Flex, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { ThemeProvider } from "@/hooks/theme-provider";
import { getAuth, getSignInUrl } from "../authkit/serverFunctions";
import Footer from "../components/footer";
import SignInButton from "../components/sign-in-button";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	convexClient: ConvexReactClient;
	convexQueryClient: ConvexQueryClient;
}>()({
	beforeLoad: async () => {
		const fullAuth = await getAuth();

		const { user } = fullAuth;
		return { user, fullAuth };
	},
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
				title: "AuthKit Example in TanStack Start",
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
	loader: async ({ context }) => {
		const { user, fullAuth } = context;
		const url = await getSignInUrl();
		return {
			user,
			url,
			fullAuth,
		};
	},
	component: RootComponent,
	notFoundComponent: () => <div>Not Found</div>,
});

function RootComponent() {
	const context = useRouteContext({ from: Route.id });
	const { fullAuth, user, url } = Route.useLoaderData();
	return (
		<RootDocument>
			<ConvexProviderWithAuth
				client={context.convexClient}
				useAuth={() => {
					return {
						isLoading: false,
						isAuthenticated: fullAuth.accessToken ? true : false,
						fetchAccessToken: async (_args: { forceRefreshToken: boolean }) =>
							(await getAuth()).accessToken ?? null,
					};
				}}
			>
				<ThemeProvider>
					<Theme
						accentColor="iris"
						panelBackground="solid"
						style={{ backgroundColor: "var(--gray-1)" }}
					>
						<Container style={{ backgroundColor: "var(--gray-1)" }}>
							<Flex direction="column" gap="5" p="5" height="100vh">
								<Box asChild flexGrow="1">
									<Card size="4">
										<Flex direction="column" height="100%">
											<Flex asChild justify="between">
												<header>
													<Flex gap="4">
														<Button asChild variant="soft">
															<Link to="/">Home</Link>
														</Button>

														<Button asChild variant="soft">
															<Link to="/admin">Admin</Link>
														</Button>
													</Flex>

													<Suspense fallback={<div>Loading...</div>}>
														<SignInButton user={user} url={url} />
													</Suspense>
												</header>
											</Flex>

											<Flex flexGrow="1" align="center" justify="center">
												<main>
													<Outlet />
												</main>
											</Flex>
										</Flex>
									</Card>
								</Box>
								<Footer />
							</Flex>
						</Container>
					</Theme>
				</ThemeProvider>
			</ConvexProviderWithAuth>
			<TanStackRouterDevtools position="bottom-right" />
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
