---
name: Place Image Upload Form
overview: Create a dedicated image upload form component for places that uploads images to Cloudflare R2, extracts EXIF metadata (location/datetime), generates a low-res AVIF thumbnail as base64, and updates the image record with all metadata using the returned image ID.
todos:
  - id: install-exif
    content: Install exifreader package for EXIF metadata extraction
    status: pending
  - id: exif-utils
    content: Add EXIF extraction functions to src/lib/image-utils.ts
    status: pending
    dependencies:
      - install-exif
  - id: modify-onupload
    content: Modify onUpload callback to return image _id from ctx.db.insert()
    status: pending
  - id: upload-form
    content: Create PlaceImageUploadForm component with R2 upload and thumbnail generation
    status: pending
    dependencies:
      - exif-utils
      - modify-onupload
  - id: integrate-admin
    content: Integrate the upload form into admin place detail page
    status: pending
    dependencies:
      - upload-form
---

# Place Image Upload Form Implementation

## Overview

Add a dedicated image upload form for places that leverages the existing Convex R2 integration:

1. Upload full-resolution images to Cloudflare R2 
2. `onUpload` creates image record and returns the `_id`
3. Extract GPS coordinates and capture datetime from EXIF metadata (client-side)
4. Generate a low-res AVIF thumbnail stored as base64 (client-side)
5. Update the image record with metadata using the `update` mutation

## Architecture

```mermaid
flowchart LR
    A[File Input] --> B[Extract EXIF + Generate Thumbnail]
    A --> C[useUploadFile uploads to R2]
    C --> D[onUpload creates record, returns _id]
    D --> E[Hook returns image _id]
    B --> F[Call update mutation with _id]
    E --> F
    F --> G[Complete image record with metadata]
```



## Existing Code to Leverage

- [convex/functions/image.ts](convex/functions/image.ts) lines 61-75: `onUpload` callback - modify to return `_id`
- [convex/functions/image.ts](convex/functions/image.ts) lines 110-126: `update` mutation patches image record
- [src/lib/image-utils.ts](src/lib/image-utils.ts): decode, encode, resize, blobToBase64 utilities

## Implementation Steps

### 1. Install EXIF Library

Install `exifreader` package to parse EXIF metadata from images.

### 2. Add EXIF Extraction Utility

Extend `src/lib/image-utils.ts` with a function to extract:

- GPS coordinates (lat/lng) from EXIF GPSLatitude/GPSLongitude
- DateTime from EXIF DateTimeOriginal or DateTime tags

### 3. Modify onUpload to Return Image ID

Update the `onUpload` callback in `convex/functions/image.ts` to return the `_id` from `ctx.db.insert()` so the client can use it for the update.

### 4. Create PlaceImageUploadForm Component

Build a React component that:

- Uses `useUploadFile` hook from `@convex-dev/r2/react` 