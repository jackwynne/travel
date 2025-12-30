import { useNavigate } from "@tanstack/react-router";
import { AuthKitProvider } from "@workos-inc/authkit-react";

const VITE_WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID as
	| string
	| undefined;
const VITE_WORKOS_API_HOSTNAME = import.meta.env.VITE_WORKOS_API_HOSTNAME as
	| string
	| undefined;

export default function AppWorkOSProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const navigate = useNavigate();

	if (!VITE_WORKOS_CLIENT_ID || !VITE_WORKOS_API_HOSTNAME) {
		// Avoid crashing SSR/dev if WorkOS isn't configured yet.
		console.warn(
			"[workos] Missing env vars. Set VITE_WORKOS_CLIENT_ID and VITE_WORKOS_API_HOSTNAME in .env.local to enable auth.",
		);
		return children;
	}

	return (
		<AuthKitProvider
			clientId={VITE_WORKOS_CLIENT_ID}
			apiHostname={VITE_WORKOS_API_HOSTNAME}
			onRedirectCallback={({ state }) => {
				if (state?.returnTo) {
					navigate(state.returnTo);
				}
			}}
		>
			{children}
		</AuthKitProvider>
	);
}
