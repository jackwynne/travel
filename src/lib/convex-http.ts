import { ConvexHttpClient } from "convex/browser";

// Create a singleton HTTP client for use in route loaders
let httpClient: ConvexHttpClient | null = null;

export function getConvexHttpClient() {
	if (!httpClient) {
		const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;
		if (!CONVEX_URL) {
			throw new Error("missing VITE_CONVEX_URL env var");
		}
		httpClient = new ConvexHttpClient(CONVEX_URL);
	}
	return httpClient;
}

