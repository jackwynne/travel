---
name: Add WorkOS Auth
overview: Create a reusable authentication helper and add WorkOS authentication checks to all create, update, and delete mutations across the convex/functions directory.
todos:
  - id: create-auth-helper
    content: Create convex/functions/auth.ts with requireAuth helper function
    status: pending
  - id: update-country
    content: Add requireAuth to country.ts mutations (create, update, remove)
    status: pending
    dependencies:
      - create-auth-helper
  - id: update-city
    content: Add requireAuth to city.ts mutations (create, update, remove)
    status: pending
    dependencies:
      - create-auth-helper
  - id: update-place
    content: Add requireAuth to place.ts mutations (create, update, remove, copyFromImage)
    status: pending
    dependencies:
      - create-auth-helper
  - id: update-image
    content: Add requireAuth to image.ts mutations (update, remove)
    status: pending
    dependencies:
      - create-auth-helper
---

# Add WorkOS Authentication to Convex Functions

## Overview

Create a centralized `requireAuth` helper function and integrate it into all mutations that modify data (create, update, delete) across the four function files.

## Implementation

### 1. Create Auth Helper File

Create a new file [`convex/functions/auth.ts`](convex/functions/auth.ts) with a reusable `requireAuth` helper:

```typescript
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
    * Requires the user to be authenticated via WorkOS.
    * Throws an error if not authenticated.
    * Returns the user identity for further use if needed.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: You must be logged in to perform this action");
  }
  return identity;
}
```

This helper:

- Uses `ctx.auth.getUserIdentity()` to check authentication
- Throws a clear error message if not authenticated
- Returns the identity object for optional use (e.g., logging, audit trails)
- Can be easily modified later (per your requirement for future updates)

### 2. Update Function Files

Add `requireAuth` call at the start of each mutation handler:**[`convex/functions/country.ts`](convex/functions/country.ts)** - 3 mutations:

- `create` (line 24)
- `update` (line 39)
- `remove` (line 84)

**[`convex/functions/city.ts`](convex/functions/city.ts)** - 3 mutations:

- `create` (line 23)
- `update` (line 42)
- `remove` (line 103)

**[`convex/functions/place.ts`](convex/functions/place.ts)** - 4 mutations:

- `create` (line 27)
- `update` (line 42)
- `remove` (line 63)
- `copyFromImage` (line 138)

**[`convex/functions/image.ts`](convex/functions/image.ts)** - 2 mutations:

- `update` (line 124)
- `remove` (line 199)

### 3. Example of Updated Mutation

```typescript
import { requireAuth } from "./auth";

export const create = mutation({
  args: { country: countryCreateValidator },
  returns: v.id("country"),
  handler: async (ctx, args) => {
    await requireAuth(ctx);  // <-- Add this line
    return await ctx.db.insert("country", { ...args.country });
  },
});
```



## Files Changed

| File | Changes ||------|---------|| `convex/functions/auth.ts` | New file with `requireAuth` helper || `convex/functions/country.ts` | Add auth to 3 mutations || `convex/functions/city.ts` | Add auth to 3 mutations || `convex/functions/place.ts` | Add auth to 4 mutations || `convex/functions/image.ts` | Add auth to 2 mutations |

## Notes

- Query functions (`getOne`, `getMany`, etc.) remain public and unauthenticated