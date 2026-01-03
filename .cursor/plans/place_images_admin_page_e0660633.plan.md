---
name: Place Images Admin Page
overview: Add a new admin page to view/edit images associated with a place, with functionality to copy image iconImage and lat/lng coordinates to the parent place.
todos:
  - id: add-image-query
    content: Add getByPlace query in convex/functions/image.ts
    status: completed
  - id: add-place-mutation
    content: Add copyFromImage mutation in convex/functions/place.ts
    status: completed
  - id: create-place-layout
    content: Create place.$placeId.tsx layout route file
    status: completed
  - id: create-images-page
    content: Create place.$placeId/index.tsx images page
    status: completed
  - id: create-image-table
    content: Create ImageTable.tsx component
    status: completed
  - id: create-image-form
    content: Create ImageEditForm.tsx component
    status: completed
  - id: update-exports
    content: Update admin component exports
    status: completed
---

# Place Images Admin Page

## Overview

Add a new page in the admin panel at `/admin/country/$countryId/city/$cityId/place/$placeId/` to view and manage images associated with a place, including the ability to edit image details and copy the image's `iconImage` and `lat/lng` coordinates to the parent place.

## Files to Create

### 1. Backend - Convex Functions

**[convex/functions/image.ts](convex/functions/image.ts)** - Add new query and mutation:

- `getByPlace` query - Fetch all images associated with a specific place using the existing `byImageType_byLocationId` index
- Add logic to also return the image URLs using `r2.getUrl()`

**[convex/functions/place.ts](convex/functions/place.ts)** - Add new mutation:

- `copyFromImage` mutation - Update a place's `iconImage` and/or `lat/lng` from a specific image

### 2. Frontend - New Route Files

**`src/routes/admin/country.$countryId/city.$cityId/place.$placeId/index.tsx`** - The images list page for a place, following the existing pattern**`src/routes/admin/country.$countryId/city.$cityId/place.$placeId.tsx`** - Layout wrapper for the place route

### 3. Frontend - New Components

**`src/components/admin/ImageTable.tsx`** - Table component to display images for a place with:

- Image thumbnail display
- Description, dateTime, lat/lng display
- Edit, Delete actions
- "Set as Place Icon" and "Copy Location to Place" action buttons

**`src/components/admin/ImageEditForm.tsx`** - Form to edit existing image details:

- Description field
- Lat/lng fields (editable)
- DateTime field (editable)

### 4. Update Component Index

**[src/components/admin/index.ts](src/components/admin/index.ts)** - Export new components

## Data Flow

```mermaid
flowchart TD
    A[PlaceImagesPage] --> B[getByPlace Query]
    B --> C[ImageTable]
    C --> D[ImageEditForm Dialog]
    C --> E[Copy iconImage to Place]
    C --> F[Copy lat/lng to Place]
    E --> G[place.copyFromImage Mutation]
    F --> G
    D --> H[image.update Mutation]
```