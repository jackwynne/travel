import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import schema from "../schema";
import { requireAuth } from "./auth";
import { r2 } from "./image";

const { ...concertCreateValidatorFields } =
	schema.tables.concert.validator.fields;

const concertCreateValidator = v.object(concertCreateValidatorFields);
const concertUpdateValidator = v.object({
	_id: v.id("concert"),
	_creationTime: v.number(),
	...schema.tables.concert.validator.fields,
});

const concertValidator = v.object({
	_id: v.id("concert"),
	_creationTime: v.number(),
	...schema.tables.concert.validator.fields,
});

/**
 * Create a new concert.
 */
export const create = mutation({
	args: {
		concert: concertCreateValidator,
	},
	returns: v.id("concert"),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const place = await ctx.db.get(args.concert.placeId);
		if (!place) {
			throw new Error("Place not found");
		}
		return await ctx.db.insert("concert", {
			...args.concert,
		});
	},
});

/**
 * Update an existing concert.
 */
export const update = mutation({
	args: {
		concert: concertUpdateValidator,
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const { _id, _creationTime, ...updates } = args.concert;
		const concert = await ctx.db.get(_id);
		if (!concert) {
			throw new Error("Concert not found");
		}

		if (updates.placeId) {
			const place = await ctx.db.get(updates.placeId);
			if (!place) {
				throw new Error("Place not found");
			}
		}

		return await ctx.db.patch(_id, {
			...updates,
		});
	},
});

/**
 * Delete a concert by ID.
 */
export const remove = mutation({
	args: {
		id: v.id("concert"),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const concert = await ctx.db.get(args.id);
		if (!concert) {
			throw new Error("Concert not found");
		}
		await ctx.db.delete(args.id);
		return null;
	},
});

/**
 * Set or clear the featured image for a concert.
 */
export const setFeaturedImage = mutation({
	args: {
		concertId: v.id("concert"),
		imageId: v.optional(v.id("image")),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const concert = await ctx.db.get(args.concertId);
		if (!concert) {
			throw new Error("Concert not found");
		}

		if (args.imageId) {
			const image = await ctx.db.get(args.imageId);
			if (!image) {
				throw new Error("Image not found");
			}
			if (
				image.location?.imageType !== "concert" ||
				image.location.locationId !== args.concertId
			) {
				throw new Error("Image is not linked to this concert");
			}
		}

		await ctx.db.patch(args.concertId, {
			featuredImageId: args.imageId,
		});

		return null;
	},
});

/**
 * Get a single concert by ID.
 */
export const getOne = query({
	args: {
		id: v.id("concert"),
	},
	returns: v.union(concertValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

/**
 * Get all concerts, optionally filtered by place.
 */
export const getMany = query({
	args: {
		placeId: v.optional(v.id("place")),
	},
	returns: v.array(concertValidator),
	handler: async (ctx, args) => {
		if (args.placeId !== undefined) {
			const placeId = args.placeId;
			return await ctx.db
				.query("concert")
				.withIndex("byPlace", (q) => q.eq("placeId", placeId))
				.collect();
		}
		return await ctx.db.query("concert").order("desc").collect();
	},
});

/**
 * Get concerts with their images and resolved location data for the gallery.
 */
export const getGallery = query({
	args: {},
	handler: async (ctx) => {
		const concerts = await ctx.db.query("concert").collect();
		const places = await ctx.db.query("place").collect();
		const cities = await ctx.db.query("city").collect();

		const placeMap = new Map(places.map((place) => [place._id, place]));
		const cityMap = new Map(cities.map((city) => [city._id, city]));

		const sortedConcerts = [...concerts].sort((a, b) => {
			const aTime = a.dateTime ?? a._creationTime;
			const bTime = b.dateTime ?? b._creationTime;
			return bTime - aTime;
		});

		return await Promise.all(
			sortedConcerts.map(async (concert) => {
				const place = placeMap.get(concert.placeId);
				const city = place ? cityMap.get(place.cityId) : null;

				const images = await ctx.db
					.query("image")
					.withIndex("byImageType_byLocationId", (q) =>
						q
							.eq("location.imageType", "concert")
							.eq("location.locationId", concert._id),
					)
					.collect();

				const imagesWithUrl = await Promise.all(
					images.map(async (image) => ({
						...image,
						url: await r2.getUrl(image.key),
					})),
				);

				let featuredImage = null;
				let orderedImages = imagesWithUrl;

				if (concert.featuredImageId) {
					const selected = imagesWithUrl.find(
						(image) => image._id === concert.featuredImageId,
					);
					if (selected) {
						featuredImage = selected;
						orderedImages = [
							selected,
							...imagesWithUrl.filter(
								(image) => image._id !== concert.featuredImageId,
							),
						];
					}
				}

				return {
					...concert,
					placeName: place?.name ?? "Unknown venue",
					cityName: city?.name ?? "Unknown city",
					cityId: city?._id ?? null,
					countryId: city?.countryId ?? null,
					featuredImageId: concert.featuredImageId ?? null,
					featuredImage,
					images: orderedImages,
					imageCount: imagesWithUrl.length,
				};
			}),
		);
	},
});
