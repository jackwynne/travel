---
name: City photos + hero label
overview: Add a City Photos uploader/table to the city admin page by reusing the existing image+R2 pipeline and adding a city-scoped image query. Update homepage featured rendering to label city-featured images differently from place-featured images.
todos:
  - id: convex-image-getByCity
    content: Add `getByCity` query in `convex/functions/image.ts` (with validators) and ensure it returns images + URLs for a given cityId.
    status: pending
  - id: admin-city-photo-components
    content: Create `CityImageUploadForm` + `CityImageTable` components using the existing R2 upload + image edit/delete patterns.
    status: pending
    dependencies:
      - convex-image-getByCity
  - id: wire-city-admin-page
    content: Add the City Photos section to the city admin page `src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx`.
    status: pending
    dependencies:
      - admin-city-photo-components
  - id: homepage-featured-label
    content: Extend `convex/functions/homepage.ts:getFeaturedImages` to return `imageType`, and update `src/routes/index.tsx` hero badge text based on that field.
    status: pending
---

# City photo admin + homepage featured label

## Goals

- Add **City Photos** management (upload + list + edit/delete) to the city admin page: [`src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx`](src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx).
- Ensure uploaded city photos are stored as `image.location.imageType = "city"` and `image.location.locationId = cityId` (already supported by schema).
- Update homepage hero to display a different badge/label when the featured image is attached to a **city** (vs a **place**).

## Key design choices

- **Reuse the existing `image` table** and its `location` discriminated union (no new table).
- **Add a new Convex query** for city-scoped images (`getByCity`), symmetric to existing `getByPlace`.
- **Add new UI components** for city image upload + table, modeled after `PlaceImageUploadForm` and `ImageTable`, but with city-specific behavior.
- **Homepage featured images query** will return an extra `imageType` field so the UI can render `Featured City` vs `Featured Place`.

## Backend changes (Convex)

- Update [`convex/functions/image.ts`](convex/functions/image.ts)
- Add `getByCity` query that uses the existing index `byImageType_byLocationId`:
    - `location.imageType == "city"`
    - `location.locationId == args.cityId`
- Return the same shape used elsewhere (image fields + `url` from `r2.getUrl`).
- Include **args/returns validators** for the new function.
- Update [`convex/functions/homepage.ts`](convex/functions/homepage.ts)
- Extend `getFeaturedImages` to return `imageType: "city" | "place" | null` (or `undefined` when no location), derived from `image.location?.imageType`.
- Keep existing behavior for `locationName`, `countryId`, `cityId` resolution.

## Frontend changes (Admin)

- Add `City Photos` section to [`src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx`](src/routes/_authenticated/admin/country.$countryId/city.$cityId/index.tsx)
- Add a new card/section alongside existing `PlaceTable` and `RouteTable`.
- Render a city image table component there.
- Add new components:
- [`src/components/admin/CityImageUploadForm.tsx`](src/components/admin/CityImageUploadForm.tsx)
    - Copy the existing upload pipeline from `PlaceImageUploadForm`, but set:
    - `location: { imageType: "city", locationId: cityId }`
- [`src/components/admin/CityImageTable.tsx`](src/components/admin/CityImageTable.tsx)
    - Query `api.functions.image.getByCity`.
    - Provide actions:
    - Edit (reusing `ImageEditForm`)
    - Delete (reusing `api.functions.image.remove`)
    - Upload (opens `CityImageUploadForm` dialog)
- Update admin barrel export if needed: [`src/components/admin/index.ts`](src/components/admin/index.ts)

## Frontend changes (Homepage)

- Update [`src/routes/index.tsx`](src/routes/index.tsx)
- In `HeroSection`, render the badge text based on `image.imageType`:
    - `"Featured City"` when `imageType === "city"`
    - `"Featured Place"` (or keep existing wording) when `imageType === "place"`
- Keep the Explore link behavior unchanged.

## Implementation notes

- Existing schema already supports city-linked images:
- `image.location.imageType` can be `"city"` and `locationId` can be `v.id("city")`.
- We will mirror the existing UX patterns used for place images (dialogs, edit form, delete confirmation).

## Validation / sanity checks

- Upload a city image and confirm:
- it appears in the new city images table
- editing can toggle `featured`
- it appears in the Featured Images admin page when featured