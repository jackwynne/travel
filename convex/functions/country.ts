import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";

const { ...countryCreateValidatorFields } =
	schema.tables.country.validator.fields;

const countryCreateValidator = v.object(countryCreateValidatorFields);
const countryUpdateValidator = v.object({
	_id: v.id("country"),
	_creationTime: v.number(),
	...schema.tables.country.validator.fields,
});

const countryValidator = v.object({
	_id: v.id("country"),
	_creationTime: v.number(),
	...schema.tables.country.validator.fields,
});

/**
 * Create a new country with name and coordinates.
 */
export const create = mutation({
	args: {
		country: countryCreateValidator,
	},
	returns: v.id("country"),
	handler: async (ctx, args) => {
		return await ctx.db.insert("country", {
			...args.country,
		});
	},
});

/**
 * Update an existing country.
 */
export const update = mutation({
	args: {
		country: countryUpdateValidator,
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { _id, _creationTime, ...updates } = args.country;
		const country = await ctx.db.get(_id);
		if (!country) {
			throw new Error("Country not found");
		}

		return await ctx.db.patch(_id, {
			...updates,
		});
	},
});

/**
 * Get a single country by ID.
 */
export const getOne = query({
	args: {
		id: v.id("country"),
	},
	returns: v.union(countryValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

/**
 * Get all countries.
 */
export const getMany = query({
	args: {},
	returns: v.array(countryValidator),
	handler: async (ctx) => {
		return await ctx.db.query("country").collect();
	},
});

/**
 * Delete a country by ID.
 */
export const remove = mutation({
	args: {
		id: v.id("country"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const country = await ctx.db.get(args.id);
		if (!country) {
			throw new Error("Country not found");
		}
		await ctx.db.delete(args.id);
		return null;
	},
});
