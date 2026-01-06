---
name: Admin Homepage
overview: Create an admin homepage at `/admin` with navigation cards linking to countries management (which contains nested cities/places/images) and the colours page.
todos:
  - id: update-admin-index
    content: Update admin/index.tsx to show dashboard with navigation cards
    status: completed
---

# Admin Homepage

## Overview

Create a dashboard-style admin homepage that provides quick navigation to:

- **Countries** - Entry point to the hierarchical content management (Countries > Cities > Places > Images)
- **Colours** - Link to the design system colour palette

## Current Structure

The admin routes are hierarchically organized:

- `/admin` - Homepage (currently shows CountryTable)
- `/admin/country.$countryId` - Country details with cities
- `/admin/country.$countryId/city.$cityId` - City details with places
- `/admin/country.$countryId/city.$cityId/place.$placeId` - Place details with images
- `/admin/colours` - Colours page

Since cities, places, and images are accessed through their parent resources (country > city > place), the homepage will direct users to the Countries section as the main entry point for content management.

## Implementation

Modify [`src/routes/_authenticated/admin/index.tsx`](src/routes/_authenticated/admin/index.tsx) to:

1. Replace the current `CountryTable` with a dashboard layout
2. Add navigation cards for:

- **Countries** - Primary content management entry point with description of the hierarchy
- **Colours** - Design system colour palette

3. Use existing UI components (`Card`, `Link`) and match the project's styling patterns
4. Include the `AdminBreadcrumb` component with "Dashboard" as the current page

## Design

- Grid layout with navigation cards
- Each card shows:
- Icon
- Title
- Description