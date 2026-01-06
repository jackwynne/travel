---
name: Fix Admin Sidebar Navigation
overview: Update the AdminSidebar to make country names directly clickable (removing the Overview sub-button) and fix the Dashboard, Colours, and All Countries buttons to be properly clickable links using the `asChild` pattern.
todos:
  - id: fix-nav-buttons
    content: Fix Dashboard, Colours, and All Countries buttons using asChild pattern
    status: completed
  - id: restructure-country-collapsible
    content: Restructure country collapsible with clickable name and separate chevron toggle
    status: completed
  - id: remove-overview
    content: Remove the Overview sub-button from country collapsibles
    status: completed
  - id: update-imports
    content: Add SidebarMenuAction to imports
    status: completed
---

# Fix Admin Sidebar Navigation

## Changes Required

### 1. Fix Dashboard, Colours, and All Countries buttons

The current implementation uses `render={<Link ... />}` which may not be working correctly. Change to use the `asChild` prop pattern which is the standard shadcn/ui approach:**Current (not working):**

```tsx
<SidebarMenuButton
  render={<Link to="/admin" />}
  isActive={isDashboardActive}
  tooltip="Dashboard"
>
```

**Updated (working):**

```tsx
<SidebarMenuButton asChild isActive={isDashboardActive} tooltip="Dashboard">
  <Link to="/admin">
    <Home className="size-4" />
    <span>Dashboard</span>
  </Link>
</SidebarMenuButton>
```

Apply this pattern to:

- Dashboard button (lines 121-128)
- Colours button (lines 132-139)
- All Countries button (lines 143-150)

### 2. Make country names clickable and remove Overview button

For countries with cities, restructure the collapsible to:

- Make the country name a clickable link (navigates to country page)
- Keep the chevron as a separate button for expanding/collapsing cities
- Remove the "Overview" sub-button (lines 206-218)

**Structure change:**

```tsx
<Collapsible ...>
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isCountryActive} tooltip={country.name}>
      <Link to="/admin/country/$countryId" params={{ countryId: country._id }}>
        <Globe className="size-4" />
        <span>{country.name}</span>
      </Link>
    </SidebarMenuButton>
    <CollapsibleTrigger asChild>
      <SidebarMenuAction>
        <ChevronRight className="transition-transform ..." />
      </SidebarMenuAction>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <SidebarMenuSub>
        {/* Cities only - no Overview button */}
        {countryCities.map((city) => ...)}
      </SidebarMenuSub>
    </CollapsibleContent>
  </SidebarMenuItem>
</Collapsible>
```



### 3. Update imports

Add `SidebarMenuAction` to the imports from `@/components/ui/sidebar` (needed for the chevron toggle button).

## File to modify