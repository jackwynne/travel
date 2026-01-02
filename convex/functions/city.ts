import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import schema from '../schema'

const { ...cityCreateValidatorFields } = schema.tables.city.validator.fields

const cityCreateValidator = v.object(cityCreateValidatorFields)
const cityUpdateValidator = v.object({
  _id: v.id('city'),
  _creationTime: v.number(),
  ...schema.tables.city.validator.fields,
})

const cityValidator = v.object({
  _id: v.id('city'),
  _creationTime: v.number(),
  ...schema.tables.city.validator.fields,
})

/**
 * Create a new city with name, coordinates, and country reference.
 */
export const create = mutation({
  args: {
    city: cityCreateValidator,
  },
  returns: v.id('city'),
  handler: async (ctx, args) => {
    const country = await ctx.db.get(args.city.countryId)
    if (!country) {
      throw new Error('Country not found')
    }
    return await ctx.db.insert('city', {
      ...args.city,
    })
  },
})

/**
 * Update an existing city.
 */
export const update = mutation({
  args: {
    city: cityUpdateValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { _id, _creationTime, ...updates } = args.city
    const city = await ctx.db.get(_id)
    if (!city) {
      throw new Error('City not found')
    }

    if (updates.countryId) {
      const country = await ctx.db.get(updates.countryId)
      if (!country) {
        throw new Error('Country not found')
      }
    }

    return await ctx.db.patch(_id, {
      ...updates,
    })
  },
})

/**
 * Get a single city by ID.
 */
export const getOne = query({
  args: {
    id: v.id('city'),
  },
  returns: v.union(cityValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Get all cities, optionally filtered by country.
 */
export const getMany = query({
  args: {
    countryId: v.optional(v.id('country')),
  },
  returns: v.array(cityValidator),
  handler: async (ctx, args) => {
    const { countryId } = args
    if (countryId !== undefined) {
      return await ctx.db
        .query('city')
        .withIndex('byCountry', (q) => q.eq('countryId', countryId))
        .collect()
    }
    return await ctx.db.query('city').collect()
  },
})

/**
 * Delete a city by ID.
 */
export const remove = mutation({
  args: {
    id: v.id('city'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const city = await ctx.db.get(args.id)
    if (!city) {
      throw new Error('City not found')
    }
    await ctx.db.delete(args.id)
    return null
  },
})
