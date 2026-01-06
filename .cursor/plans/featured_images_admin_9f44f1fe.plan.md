---
name: Featured Images Admin
overview: Add a featured image toggle to the ImageEditForm and create a new admin page with a table displaying all featured images.
todos:
  - id: image-edit-form
    content: Add featured toggle to ImageEditForm component
    status: completed
  - id: featured-query
    content: Add getFeatured query to convex/functions/image.ts
    status: completed
  - id: featured-table
    content: Create FeaturedImagesTable component
    status: completed
  - id: export-component
    content: Export FeaturedImagesTable from admin index
    status: completed
  - id: featured-route
    content: Create admin featured images route page
    status: completed
  - id: sidebar-link
    content: Add Featured Images link to AdminSidebar
    status: completed
  - id: dashboard-card
    content: Add Featured Images card to admin dashboard
    status: completed
---

# Featured Images Admin

## Summary

This plan adds the ability to mark images as "featured" via a toggle in the edit form, and creates a dedicated admin page to view and manage all featured images.

## Current State

- The `image` table in [`convex/schema.ts`](convex/schema.ts) already has a `featured: v.optional(v.boolean())` field and a `byFeatured` index
- The `update` mutation in [`convex/functions/image.ts`](convex/functions/image.ts) already supports updating the `featured` field
- No query exists yet to fetch featured images

## Implementation

### 1. Update ImageEditForm with Featured Toggle

Modify [`src/components/admin/ImageEditForm.tsx`](src/components/admin/ImageEditForm.tsx):

- Add `featured` to the `ImageWithUrl` type
- Add `featured` to the form's `defaultValues`
- Add a Switch toggle field for the featured property
- Update the form submission to include the `featured` value

### 2. Add Query for Featured Images

Add a new query to [`convex/functions/image.ts`](convex/functions/image.ts):

```ts
export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db
      .query("image")
      .withIndex("byFeatured", (q) => q.eq("featured", true))
      .collect();
    return Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await r2.getUrl(image.key),
      })),
    );
  },
});
```



### 3. Create FeaturedImagesTable Component

Create [`src/components/admin/FeaturedImagesTable.tsx`](src/components/admin/FeaturedImagesTable.tsx):

- Display table with columns: Thumbnail, Description, Capture Date, Location, Actions
- Include Edit and Remove from Featured functionality
- Reuse the `ImageEditForm` for editing in a dialog
- Follow the existing pattern from `ImageTable.tsx`

### 4. Export New Component

Update [`src/components/admin/index.ts`](src/components/admin/index.ts) to export the new `FeaturedImagesTable`.

### 5. Create Featured Images Admin Route

Create [`src/routes/_authenticated/admin/featured.tsx`](src/routes/_authenticated/admin/featured.tsx):

- Set up route with `beforeLoad` for page context (title: "Featured Images")
- Render the `FeaturedImagesTable` component
- Follow the existing admin page pattern

### 6. Add Navigation Link to Sidebar

Update [`src/components/admin/AdminSidebar.tsx`](src/components/admin/AdminSidebar.tsx):

- Add a "Featured Images" menu item with the `Star` icon from lucide-react
- Link to `/admin/featured`
- Add active state detection

### 7. Update Admin Dashboard (Optional)

Update [`src/routes/_authenticated/admin/index.tsx`](src/routes/_authenticated/admin/index.tsx) to include Featured Images as a navigation card option.

## File Changes

| File | Action |

|------|--------|

| `src/components/admin/ImageEditForm.tsx` | Modify |

| `convex/functions/image.ts` | Modify |

| `src/components/admin/FeaturedImagesTable.tsx` | Create |

| `src/components/admin/index.ts` | Modify |

| `src/routes/_authenticated/admin/featured.tsx` | Create |

| `src/components/admin/AdminSidebar.tsx` | Modify |