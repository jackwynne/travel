import { useNavigate } from "@tanstack/react-router";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { useEffect, useState } from "react";

const VITE_WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID as
	| string
	| undefined;
const VITE_WORKOS_API_HOSTNAME = import.meta.env.VITE_WORKOS_API_HOSTNAME as
	| string
	| undefined;

// Check if we're running on the client
const isClient = typeof window !== "undefined";

export default function AppWorkOSProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const navigate = useNavigate();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		console.log("[WorkOS Auth Debug] Provider mounted on client", {
			hasClientId: !!VITE_WORKOS_CLIENT_ID,
			hasApiHostname: !!VITE_WORKOS_API_HOSTNAME,
			clientIdLength: VITE_WORKOS_CLIENT_ID?.length ?? 0,
		});
	}, []);

	// During SSR or before mount, just render children
	if (!isClient || !mounted) {
		return <>{children}</>;
	}

	if (!VITE_WORKOS_CLIENT_ID || !VITE_WORKOS_API_HOSTNAME) {
		// Avoid crashing if WorkOS isn't configured.
		console.warn(
			"[workos] Missing env vars. Set VITE_WORKOS_CLIENT_ID and VITE_WORKOS_API_HOSTNAME in .env.local to enable auth.",
		);
		return <>{children}</>;
	}

	return (
		<AuthKitProvider
			clientId={VITE_WORKOS_CLIENT_ID}
			apiHostname={VITE_WORKOS_API_HOSTNAME}
			onRedirectCallback={({ state }) => {
				console.log("[WorkOS Auth Debug] onRedirectCallback", { state });
				if (state?.returnTo) {
					navigate(state.returnTo);
				}
			}}
		>
			{children}
		</AuthKitProvider>
	);
}
