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

	const fetchAccessToken = useCallback(
		async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
			console.log(
				"[Convex Auth Debug] fetchAccessToken called, forceRefresh:",
				forceRefreshToken,
			);
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
		[getAccessToken],
	);

	const authState = useMemo(
		() => ({
			isLoading: isLoading ?? true,
			isAuthenticated: !!user,
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
