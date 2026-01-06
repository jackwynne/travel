---
name: City Page Header/Footer
overview: Apply the same header/footer layout from the index route to the city detail route, and update the footer button to link to the currently viewed city using TanStack Router params.
todos:
  - id: city-header-footer-wrap
    content: Add the index header/footer layout to the city route component and remove the city page’s old header wrapper (keeping its content in main).
    status: completed
  - id: city-footer-link
    content: Update footer Link to point to the current city route using TanStack Router params.
    status: completed
  - id: imports-cleanup
    content: Add/update imports in the city route for Link, ThemeToggle, and icons used by the copied header/footer.
    status: completed
---

# Apply index header/footer to city page

## Goal

- Copy the **header** styling/markup from `src/routes/index.tsx` (lines 44-57) and the **footer** styling/markup from `src/routes/index.tsx` (lines 71-86) into `src/routes/country.$countryId.city.$cityId.tsx`.
- Update the footer link so it routes to the **currently viewed city**.
- Per your choice: **replace** the existing city header with the index header; keep the city breadcrumb/title as part of the page body.

## Changes

- **Update** [`src/routes/country.$countryId.city.$cityId.tsx`](src/routes/country.$countryId.city.$cityId.tsx)
- Add the index header markup at the top of the page:
```44:57:src/routes/index.tsx
<header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
	<div className="container mx-auto px-4 h-14 flex items-center justify-between">
		<Link to="/" className="flex items-center gap-2 group">
			<div className="relative">
				<Plane className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
				<div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
			</div>
			<span className="font-semibold text-lg tracking-tight">
				Travel
			</span>
		</Link>
		<ThemeToggle />
	</div>
</header>
```




- Add the index footer markup at the bottom of the page and change its link target to the city route using params:
    - `to="/country/$countryId/city/$cityId"`
    - `params={{ countryId, cityId }}`
```71:86:src/routes/index.tsx
<footer className="border-t border-border/40 bg-muted/30">
	<div className="container mx-auto px-4 py-8">
		<div className="flex flex-col md:flex-row items-center justify-between gap-4">
			<div className="flex items-center gap-2 text-muted-foreground">
				<Globe className="h-4 w-4" />
				<span className="text-sm">Explore the world, one city at a time</span>
			</div>
			<Link to="/admin">
				<Button variant="outline" className="gap-2">
					<Settings className="h-4 w-4" />
					Admin Portal
				</Button>
			</Link>
		</div>
	</div>
</footer>
```




- Move the existing city breadcrumb/title block (currently inside its own `<header>`) into the `<main>` so it still shows, but the **page header** matches index.
- Ensure required imports exist in the city page (`Link`, `Plane`, `Globe`, `ThemeToggle`, and whichever icon is used for the footer button).

## Notes

- The footer button’s label can remain as-is, but it will link to the current city route; if that feels redundant on the city page, we can optionally rename it (e.g. “Copy link to this city”) after this pass.

## Implementation todos

- `city-header-footer-wrap`: Add index header/footer wrapper to `country.$countryId.city.$cityId.tsx` and adjust layout.
- `city-footer-link`: Change footer `<Link>` to `to="/country/$countryId/city/$cityId"` with `params` from `Route.useParams()`.