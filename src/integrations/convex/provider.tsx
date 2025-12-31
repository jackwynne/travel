import { ConvexProviderWithAuthKit as ConvexProvider } from "@convex-dev/workos";
import { useAuth } from "@workos-inc/authkit-react";
import { ConvexReactClient } from "convex/react";
import { useMemo } from "react";

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL as
	| string
	| undefined;

export default function AppConvexProvider({
	children,
}: {
	children: React.ReactNode;
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
		<ConvexProvider client={convexClient} useAuth={useAuth}>
			{children}
		</ConvexProvider>
	);
}
