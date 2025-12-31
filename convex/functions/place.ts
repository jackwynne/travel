import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import schema from '../schema'

const { ...placeCreateValidatorFields } =
  schema.tables.place.validator.fields

const placeCreateValidator = v.object(placeCreateValidatorFields)
const placeUpdateValidator = v.object({
  _id: v.id('place'),
  _creationTime: v.number(),
  ...schema.tables.place.validator.fields,
})

const placeValidator = v.object({
  _id: v.id('place'),
  _creationTime: v.number(),
  ...schema.tables.place.validator.fields,
})

const placeTypeValidator = v.object({
    type: v.union(schema.tables.place.validator.fields.category)
})

/**
 * Create a new place.
 */
export const create = mutation({
  args: {
    place: placeCreateValidator
  },
  returns: v.id('place'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('place', {
      ...args.place
    })
  },
})

/**
 * Update an existing place.
 */
export const update = mutation({
  args: {
    place: placeUpdateValidator
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { _id, _creationTime, ...updates } = args.place
    const place = await ctx.db.get(_id)
    if (!place) {
      throw new Error('Place not found')
    }

    return await ctx.db.patch(_id, {
      ...updates,
    })
  },
})

/**
 * Delete a place by ID.
 */
export const remove = mutation({
  args: {
    id: v.id('place'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const place = await ctx.db.get(args.id)
    if (!place) {
      throw new Error('Place not found')
    }
    await ctx.db.delete(args.id)
    return null
  },
})

/**
 * Get a single place by ID.
 */
export const getOne = query({
  args: {
    id: v.id('place'),
  },
  returns: v.union(
    placeValidator,
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Get all places, optionally filtered by city or type.
 */
export const getMany = query({
  args: {
    cityId: v.optional(v.id('city')),
    category: v.optional(v.union(schema.tables.place.validator.fields.category)),
  },
  returns: v.array(placeValidator),
  handler: async (ctx, args) => {
    const { cityId, category } = args
// Filter by city and category if provided
    if (cityId !== undefined && category !== undefined) {
        return await ctx.db
        .query('place')
        .withIndex('byCity_byCategory', (q) => q.eq('cityId', cityId).eq('category', category))
        .collect()
    }

    // Filter by city if provided
    if (cityId !== undefined) {
      return await ctx.db
        .query('place')
        .withIndex('byCity', (q) => q.eq('cityId', cityId))
        .collect()
    }

    // Filter by type if provided
    if (category !== undefined) {
      return await ctx.db
        .query('place')
        .withIndex('byCategory', (q) => q.eq('category', category))
        .collect()
    }

    // Return all places if no filters
    return await ctx.db.query('place').collect()
  },
})

