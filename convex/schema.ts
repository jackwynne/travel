import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    notes: v.optional(v.string()),
    completed: v.boolean(),
  }),
  country: defineTable({
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
  }),
  city: defineTable({
    countryId: v.id("country"),
    name: v.string(),
    lastVistitedYear: v.number(),
    lastVistitedMonth: v.number(),
    lat: v.number(),
    lng: v.number(),
  }).index("byCountry", ["countryId"]),
place: defineTable({
  cityId: v.id("city"),
  name: v.string(),
  category: v.union(v.literal("gallery"), 
                v.literal("library"), 
                v.literal("museum"), 
                v.literal("park"), 
                v.literal("restaurant"), 
                v.literal("cafe"), 
                v.literal("bar"), 
                v.literal("theatre"), 
                v.literal("other")
              ),
    description: v.string(),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    iconImage: v.string(),
    lat: v.number(),
    lng: v.number(),
  }).index("byCity_byCategory", ["cityId", "category"]).index("byCity", ["cityId"]).index("byCategory", ["category"]),
  image: defineTable(v.union(
    v.object({
    placeId: v.id("place"),
    imageKey: v.string(),
    dateTime: v.number(),
    lat: v.number(),
    lng: v.number(),
  }),
  v.object({
    cityId: v.id("city"),
    imageKey: v.string(),
    dateTime: v.number(),
    lat: v.number(),
    lng: v.number(),
  }),
)).index("byPlace", ["placeId"]).index("byCity", ["cityId"]),
});
