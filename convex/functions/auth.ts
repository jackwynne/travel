import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Requires the user to be authenticated via WorkOS.
 * Throws an error if not authenticated.
 * Returns the user identity for further use if needed.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error(
			"Unauthorized: You must be logged in to perform this action",
		);
	}
	return identity;
}
