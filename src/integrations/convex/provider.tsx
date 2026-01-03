import { useAuth } from "@workos-inc/authkit-react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL as
	| string
	| undefined;

// Check if we're running on the client
const isClient = typeof window !== "undefined";

function useAuthFromWorkOS() {
	const authResult = useAuth();

	// Debug: Log what useAuth returns
	useEffect(() => {
		console.log("[Convex Auth Debug] useAuth() returned:", {
			isLoading: authResult?.isLoading,
			hasUser: !!authResult?.user,
			hasGetAccessToken: typeof authResult?.getAccessToken,
			allKeys: authResult ? Object.keys(authResult) : "authResult is undefined",
		});
	}, [authResult]);

	const { isLoading, user, getAccessToken } = authResult ?? {
		isLoading: true,
		user: null,
		getAccessToken: async () => null,
	};

	// IMPORTANT: Don't call getAccessToken until auth is fully loaded
	// This prevents the race condition where Convex tries to fetch a token
	// before WorkOS has finished initializing
	const fetchAccessToken = useCallback(
		async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
			console.log(
				"[Convex Auth Debug] fetchAccessToken called, forceRefresh:",
				forceRefreshToken,
				"isLoading:",
				isLoading,
			);

			// If still loading, return null - Convex will retry when loading completes
			if (isLoading) {
				console.log(
					"[Convex Auth Debug] Auth still loading, returning null token",
				);
				return null;
			}

			// If no user, no token to fetch
			if (!user) {
				console.log("[Convex Auth Debug] No user, returning null token");
				return null;
			}

			try {
				const token = await getAccessToken();
				console.log(
					"[Convex Auth Debug] getAccessToken returned:",
					token ? "token exists" : "no token",
				);
				return token ?? null;
			} catch (error) {
				console.error("[Convex Auth Debug] getAccessToken error:", error);
				return null;
			}
		},
		[getAccessToken, isLoading, user],
	);

	const authState = useMemo(
		() => ({
			// Keep loading state true until WorkOS is done loading
			isLoading: isLoading ?? true,
			// Only consider authenticated when NOT loading AND user exists
			isAuthenticated: !isLoading && !!user,
			fetchAccessToken,
		}),
		[isLoading, user, fetchAccessToken],
	);

	// Debug: Log what we're returning
	useEffect(() => {
		console.log("[Convex Auth Debug] useAuthFromWorkOS returning:", {
			isLoading: authState.isLoading,
			isAuthenticated: authState.isAuthenticated,
			hasFetchAccessToken: typeof authState.fetchAccessToken,
		});
	}, [authState]);

	return authState;
}

// Create the client outside of React to ensure it's a singleton on the client
let convexClientSingleton: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
	if (!CONVEX_URL) return null;
	if (!isClient) return null; // Don't create client during SSR

	if (!convexClientSingleton) {
		console.log("[Convex Auth Debug] Creating ConvexReactClient singleton");
		convexClientSingleton = new ConvexReactClient(CONVEX_URL);
	}
	return convexClientSingleton;
}

export default function AppConvexProvider({
	children,
}: {
	children: ReactNode;
}) {
	// Use state to trigger re-render when client becomes available
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		console.log("[Convex Auth Debug] Provider mounted on client", {
			CONVEX_URL: CONVEX_URL ? "set" : "not set",
			isClient,
		});
	}, []);

	// During SSR or before mount, just render children without Convex
	if (!isClient || !mounted) {
		return <>{children}</>;
	}

	const convexClient = getConvexClient();

	if (!CONVEX_URL || !convexClient) {
		console.warn(
			"[convex] Missing env var VITE_CONVEX_URL. Set it in .env.local to enable Convex.",
		);
		return <>{children}</>;
	}

	return (
		<ConvexProviderWithAuth client={convexClient} useAuth={useAuthFromWorkOS}>
			{children}
		</ConvexProviderWithAuth>
	);
}
