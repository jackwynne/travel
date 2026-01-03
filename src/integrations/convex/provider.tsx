import { useAuth } from "@workos-inc/authkit-react";
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL as
	| string
	| undefined;

function useAuthFromWorkOS() {
	const { isLoading, user, getAccessToken } = useAuth();

	const fetchAccessToken = useCallback(
		async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
			try {
				// WorkOS AuthKit's getAccessToken handles token refresh internally
				const token = await getAccessToken();
				return token ?? null;
			} catch {
				return null;
			}
		},
		[getAccessToken],
	);

	return useMemo(
		() => ({
			isLoading,
			isAuthenticated: !!user,
			fetchAccessToken,
		}),
		[isLoading, user, fetchAccessToken],
	);
}

export default function AppConvexProvider({
	children,
}: {
	children: ReactNode;
}) {
	const convexClient = useMemo(() => {
		if (!CONVEX_URL) return null;
		return new ConvexReactClient(CONVEX_URL);
	}, []);

	if (!CONVEX_URL || !convexClient) {
		// Avoid crashing SSR/dev if Convex isn't configured yet.
		console.warn(
			"[convex] Missing env var VITE_CONVEX_URL. Set it in .env.local to enable Convex.",
		);
		return children;
	}

	return (
		<ConvexProviderWithAuth client={convexClient} useAuth={useAuthFromWorkOS}>
			{children}
		</ConvexProviderWithAuth>
	);
}
