---
name: Routes CRUD & Admin UI
overview: Create CRUD methods for the `route` table in Convex and build admin UI components (RouteTable and RouteForm) to manage routes at the city level, following the same patterns as the existing place management.
todos:
  - id: schema-index
    content: Add byCity index to route table in convex/schema.ts
    status: completed
  - id: convex-route-crud
    content: Create convex/functions/route.ts with CRUD methods
    status: completed
    dependencies:
      - schema-index
  - id: route-form
    content: Create RouteForm.tsx component with stops management
    status: completed
    dependencies:
      - convex-route-crud
  - id: route-table
    content: Create RouteTable.tsx component with table and dialogs
    status: completed
    dependencies:
      - convex-route-crud
      - route-form
  - id: admin-integration
    content: Update city admin page to display RouteTable
    status: completed
    dependencies:
      - route-table
---

# Routes CRUD & Admin UI Implementation

## Overview

Create backend CRUD operations for the `route` table and frontend admin components (table and form) to manage routes. Routes are scoped to cities and contain an array of stops (places with optional notes).

## Schema Update

Add an index to the existing `route` table in [`convex/schema.ts`](convex/schema.ts) for efficient city-based queries:

```ts
route: defineTable({
  // ... existing fields
}).index("byCity", ["city"])
```



## Backend: Convex Functions

Create [`convex/functions/route.ts`](convex/functions/route.ts) with CRUD methods following the pattern in [`convex/functions/country.ts`](convex/functions/country.ts):

- `create` - Create a new route with city, name, description, and stops
- `update` - Update an existing route
- `remove` - Delete a route by ID
- `getOne` - Get a single route by ID
- `getMany` - Get all routes for a city (using the `byCity` index)

## Frontend Components

### RouteTable Component

Create [`src/components/admin/RouteTable.tsx`](src/components/admin/RouteTable.tsx) modeled after [`PlaceTable.tsx`](src/components/admin/PlaceTable.tsx):

- Display routes in a table with name, description, and stop count
- Edit/Delete actions with confirmation dialogs
- "Add Route" button to open form dialog

### RouteForm Component

Create [`src/components/admin/RouteForm.tsx`](src/components/admin/RouteForm.tsx) modeled after [`PlaceForm.tsx`](src/components/admin/PlaceForm.tsx):

- Name and description fields
- Dynamic stops list with ability to add/remove stops
- Each stop: place selector (dropdown of places in city) + optional notes
- Uses `@tanstack/react-form` and zod validation