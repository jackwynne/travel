---
name: City photos + city icon
overview: Add City Photos upload/table to the city admin page, including quick actions to set a city icon image and copy GPS from an image. Update homepage featured hero to label city-featured images differently.
todos:
  - id: schema-city-iconImage
    content: Add `city.iconImage` optional string field to `convex/schema.ts` and regenerate types as needed.
    status: completed
  - id: convex-image-getByCity
    content: Add `getByCity` query in `convex/functions/image.ts` (with validators) to list city-linked images with URLs.
    status: completed
  - id: convex-city-copyFromImage
    content: Add `copyFromImage` mutation in `convex/functions/city.ts` to copy image iconImage and/or GPS onto a city.
    status: completed
    dependencies:
      - schema-city-iconImage
  - id: admin-city-photo-components
    content: Create `CityImageUploadForm` + `CityImageTable` with edit/delete/upload plus city icon + GPS copy actions.
    status: completed
    dependencies:
      - convex-image-getByCity
      - convex-city-copyFromImage
  - id: wire-city-admin-page
    content: Add the City Photos section to `src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx`.
    status: completed
    dependencies:
      - admin-city-photo-components
  - id: homepage-featured-label
    content: Extend `convex/functions/homepage.ts:getFeaturedImages` to return `imageType` and update `src/routes/index.tsx` hero badge text accordingly.
    status: completed
---

# City photo admin + city icon + homepage featured label

## Goals

- Add **City Photos** management (upload + list + edit/delete) to the city admin page: [`src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx`](src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx).
- Allow quick actions from the City Photos table:
- **Set as city icon**: copy `image.iconImage` → `city.iconImage`
- **Copy GPS to city**: copy `image.lat/lng` → `city.lat/lng`
- Update homepage hero to display a different badge/label when the featured image is attached to a **city** (vs a **place**).

## Key design choices

- **Reuse the existing `image` table** and its `location` discriminated union.
- Add `city.iconImage` to store the thumbnail/data URL (same pattern as `place.iconImage`).
- Add a `city.copyFromImage` mutation modeled after `place.copyFromImage`.

## Backend changes (Convex)

### Schema

- Update [`convex/schema.ts`](convex/schema.ts)
- Add `iconImage: v.optional(v.string())` to the `city` table.
- (No schema changes needed for `image`; it already supports `location.imageType = "city"`.)

### Images

- Update [`convex/functions/image.ts`](convex/functions/image.ts)
- Add `getByCity` query (with validators) using index `byImageType_byLocationId`:
    - `location.imageType == "city"`
    - `location.locationId == args.cityId`
- Return `image` fields + `url` from `r2.getUrl`.

### City copy-from-image

- Update [`convex/functions/city.ts`](convex/functions/city.ts)
- Add a new authenticated mutation `copyFromImage`:
    - **args**: `{ cityId: v.id("city"), imageId: v.id("image"), copyIconImage: v.boolean(), copyLocation: v.boolean() }`
    - **returns**: `v.null()`
    - **behavior**:
    - Load city + image; error if either missing.
    - If `copyIconImage`, set `city.iconImage = image.iconImage` (and error if missing).
    - If `copyLocation`, require `image.lat` and `image.lng`, then patch `city.lat/lng`.

### Homepage featured query

- Update [`convex/functions/homepage.ts`](convex/functions/homepage.ts)
- Extend `getFeaturedImages` to return `imageType: "city" | "place" | null` derived from `image.location?.imageType`.
- Keep existing location resolution behavior.

## Frontend changes (Admin)

### New components

- Add [`src/components/admin/CityImageUploadForm.tsx`](src/components/admin/CityImageUploadForm.tsx)
- Copy `PlaceImageUploadForm` but set:
    - `location: { imageType: "city", locationId: cityId }`
- Add [`src/components/admin/CityImageTable.tsx`](src/components/admin/CityImageTable.tsx)
- Query `api.functions.image.getByCity`.
- Actions per row:
    - **Edit**: reuse `ImageEditForm`
    - **Delete**: `api.functions.image.remove`
    - **Set as city icon** (only if `image.iconImage` exists): call `api.functions.city.copyFromImage({ copyIconImage: true, copyLocation: false })`
    - **Copy GPS to city** (only if `image.lat/lng` exist): call `api.functions.city.copyFromImage({ copyIconImage: false, copyLocation: true })`
- Upload button opens `CityImageUploadForm` in a dialog.
- Update admin barrel export if needed: [`src/components/admin/index.ts`](src/components/admin/index.ts)

### City admin page

- Update [`src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx`](src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx)
- Add a new card section for **City Photos** rendering `CityImageTable`.

## Frontend changes (Homepage)

- Update [`src/routes/index.tsx`](src/routes/index.tsx)
- Use `image.imageType` (from `getFeaturedImages`) to label the badge:
    - `Featured City` if `imageType === "city"`
    - `Featured Place` (or keep current wording) if `imageType === "place"`
- Keep Explore link behavior unchanged.

## Validation / sanity checks

- Upload a city image and confirm it:
- shows up in City Photos table
- can be edited (including featured toggle)
- can be deleted
- can set city icon (city gains `iconImage`)
- can copy GPS (city lat/lng updates)
- Mark a city image as featured and confirm: