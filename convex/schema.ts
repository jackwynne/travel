import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  products: defineTable({
		title: v.string(),
		imageId: v.string(),
		price: v.number(),
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
		iconImage: v.optional(v.string()),
	}).index("byCountry", ["countryId"]),
	place: defineTable({
		cityId: v.id("city"),
		name: v.string(),
		category: v.union(
			v.literal("gallery+museum"),
			v.literal("park"),
			v.literal("restaurant"),
			v.literal("cafe+bakery+snacks"),
			v.literal("bar+pub+club"),
			v.literal("rooftop_bar"),
			v.literal("hotel"),
			v.literal("theatre+concert_hall+venue"),
			v.literal("landmark+church+view"),
			v.literal("other"),
		),
		description: v.optional(v.string()),
		address: v.optional(v.string()),
		rating: v.optional(v.number()),
		notes: v.optional(v.string()),
		iconImage: v.optional(v.string()),
		lat: v.optional(v.number()),
		lng: v.optional(v.number()),
		lastVisitedAt: v.optional(v.number()),
	})
		.index("byCity_byCategory", ["cityId", "category"])
		.index("byCity", ["cityId"])
		.index("byCategory", ["category"]),
	image: defineTable({
		bucket: v.string(),
		key: v.string(),
		dateTime: v.optional(v.number()),
		lat: v.optional(v.number()),
		lng: v.optional(v.number()),
		description: v.optional(v.string()),
		iconImage: v.optional(v.string()),
		featured: v.optional(v.boolean()),
		location: v.optional(
			v.union(
				v.object({
					imageType: v.literal("place"),
					locationId: v.id("place"),
				}),
				v.object({
					imageType: v.literal("city"),
					locationId: v.id("city"),
				}),
			),
		),
	})
		.index("byKey", ["key"])
		.index("byImageType_byLocationId", [
			"location.imageType",
			"location.locationId",
		])
		.index("byFeatured", ["featured"]),
	route: defineTable({
		name: v.string(),
		description: v.optional(v.string()),
		city: v.id("city"),
		stops: v.array(
			v.object({
				placeId: v.id("place"),
				notes: v.optional(v.string()),
			}),
		),
	}).index("byCity", ["city"]),
});
