"use client"

import * as React from "react"
import { Link, useParams, useRouterState } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { ChevronRight, Globe, Building2, Palette, Home, Plane, PlaneTakeoff, Star } from "lucide-react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "../ThemeToggle"

const SIDEBAR_EXPANDED_KEY = "admin-sidebar-expanded-countries"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams({ strict: false }) as { countryId?: string; cityId?: string; placeId?: string }
  const { countryId, cityId } = params
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  // Fetch all countries and cities
  const countries = useQuery(api.functions.country.getMany, {}) ?? []
  const cities = useQuery(api.functions.city.getMany, {}) ?? []

  // Track which countries are expanded
  const [expandedCountries, setExpandedCountries] = React.useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY)
      if (stored) {
        try {
          return new Set(JSON.parse(stored))
        } catch {
          return new Set()
        }
      }
    }
    return new Set()
  })

  // Auto-expand current country when navigating
  React.useEffect(() => {
    if (countryId && !expandedCountries.has(countryId)) {
      setExpandedCountries((prev) => new Set([...prev, countryId]))
    }
  }, [countryId, expandedCountries])

  // Persist expanded countries
  React.useEffect(() => {
    localStorage.setItem(SIDEBAR_EXPANDED_KEY, JSON.stringify([...expandedCountries]))
  }, [expandedCountries])

  const toggleCountry = (id: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Group cities by country
  const citiesByCountry = React.useMemo(() => {
    const map = new Map<string, typeof cities>()
    for (const city of cities) {
      const existing = map.get(city.countryId) ?? []
      map.set(city.countryId, [...existing, city])
    }
    return map
  }, [cities])

  // Check if a path is active
  const isDashboardActive = currentPath === "/admin"
  const isColoursActive = currentPath === "/admin/colours"
  const isCountriesActive = currentPath === "/admin/countries"
  const isFeaturedActive = currentPath === "/admin/featured"

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/admin" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Plane className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Travel Admin</span>
                <span className="text-xs text-muted-foreground">Content Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/admin">
                <SidebarMenuButton isActive={isDashboardActive} tooltip="Dashboard">
                  <Home className="size-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link to="/admin/countries">
                <SidebarMenuButton
                  isActive={isCountriesActive}
                  tooltip="All Countries"
                >
                  <Globe className="size-4" />
                  <span>All Countries</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link to="/admin/featured">
                <SidebarMenuButton
                  isActive={isFeaturedActive}
                  tooltip="Featured Images"
                >
                  <Star className="size-4" />
                  <span>Featured Images</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link to="/admin/colours">
                <SidebarMenuButton isActive={isColoursActive} tooltip="Colours">
                  <Palette className="size-4" />
                  <span>Colours</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link to="/">
                <SidebarMenuButton isActive={false} tooltip="Back to Home">
                  <PlaneTakeoff className="size-4" />
                  <span>Back to Home</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>


        {/* Countries Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Countries</SidebarGroupLabel>
          <SidebarMenu>
            {countries.map((country) => {
              const countryCities = citiesByCountry.get(country._id) ?? []
              const isExpanded = expandedCountries.has(country._id)
              const isCountryActive = countryId === country._id && !cityId

              if (countryCities.length === 0) {
                return (
                  <SidebarMenuItem key={country._id}>
                    <Link
                      to="/admin/country/$countryId"
                      params={{ countryId: country._id }}
                    >
                      <SidebarMenuButton
                        isActive={isCountryActive}
                        tooltip={country.name}
                      >
                        <Globe className="size-4" />
                        <span>{country.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              }

              return (
                <Collapsible
                  key={country._id}
                  open={isExpanded}
                  onOpenChange={() => toggleCountry(country._id)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <Link
                      to="/admin/country/$countryId"
                      params={{ countryId: country._id }}
                    >
                      <SidebarMenuButton
                        isActive={isCountryActive}
                        tooltip={country.name}
                      >
                        <Globe className="size-4" />
                        <span>{country.name}</span>
                      </SidebarMenuButton>
                    </Link>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction
                          className="data-[state=open]:rotate-90"
                        />
                      }
                    >
                      <ChevronRight className="size-4 transition-transform duration-200" />
                      <span className="sr-only">Toggle cities</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {countryCities.map((city) => {
                          const isCityActive = cityId === city._id

                          return (
                            <SidebarMenuSubItem key={city._id}>
                              <SidebarMenuSubButton
                                isActive={isCityActive}
                                render={
                                  <Link
                                    to="/admin/country/$countryId/city/$cityId"
                                    params={{ countryId: country._id, cityId: city._id }}
                                  />
                                }
                              >
                                <Building2 className="size-3" />
                                <span>{city.name}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}

            {countries.length === 0 && (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
                No countries yet
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
