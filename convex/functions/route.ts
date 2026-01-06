import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAuth } from "./auth";

const { ...routeCreateValidatorFields } = schema.tables.route.validator.fields;

const routeCreateValidator = v.object(routeCreateValidatorFields);
const routeUpdateValidator = v.object({
	_id: v.id("route"),
	_creationTime: v.number(),
	...schema.tables.route.validator.fields,
});

const routeValidator = v.object({
	_id: v.id("route"),
	_creationTime: v.number(),
	...schema.tables.route.validator.fields,
});

/**
 * Create a new route.
 */
export const create = mutation({
	args: {
		route: routeCreateValidator,
	},
	returns: v.id("route"),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		return await ctx.db.insert("route", {
			...args.route,
		});
	},
});

/**
 * Update an existing route.
 */
export const update = mutation({
	args: {
		route: routeUpdateValidator,
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const { _id, _creationTime, ...updates } = args.route;
		const route = await ctx.db.get(_id);
		if (!route) {
			throw new Error("Route not found");
		}

		return await ctx.db.patch(_id, {
			...updates,
		});
	},
});

/**
 * Delete a route by ID.
 */
export const remove = mutation({
	args: {
		id: v.id("route"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const route = await ctx.db.get(args.id);
		if (!route) {
			throw new Error("Route not found");
		}
		await ctx.db.delete(args.id);
		return null;
	},
});

/**
 * Get a single route by ID.
 */
export const getOne = query({
	args: {
		id: v.id("route"),
	},
	returns: v.union(routeValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

/**
 * Get all routes for a city.
 */
export const getMany = query({
	args: {
		cityId: v.id("city"),
	},
	returns: v.array(routeValidator),
	handler: async (ctx, args) => {
		return await ctx.db
			.query("route")
			.withIndex("byCity", (q) => q.eq("city", args.cityId))
			.collect();
	},
});
