import { R2, type R2Callbacks } from "@convex-dev/r2";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import {
	action,
	internalMutation,
	mutation,
	query,
} from "../_generated/server";
import schema from "../schema";

export const r2 = new R2(components.r2);
const callbacks: R2Callbacks = internal.functions.image;

const { ...imageCreateValidatorFields } = schema.tables.image.validator.fields;

const imageCreateValidator = v.object(imageCreateValidatorFields);
const imageUpdateValidator = v.object({
	_id: v.id("image"),
	_creationTime: v.number(),
	...schema.tables.image.validator.fields,
});

const imageValidator = v.object({
	_id: v.id("image"),
	_creationTime: v.number(),
	...schema.tables.image.validator.fields,
});

export const {
	generateUploadUrl,
	syncMetadata,

	// These aren't used in the example, but can be exported this way to utilize
	// the permission check callbacks.
	getMetadata,
	listMetadata,
	deleteObject,
	onSyncMetadata,
} = r2.clientApi<DataModel>({
	// The checkUpload callback is used for both `generateUploadUrl` and
	// `syncMetadata`.
	// In any of these checks, throw an error to reject the request.
	checkUpload: async (ctx, bucket) => {
		// const user = await userFromAuth(ctx);
		// ...validate that the user can upload to this bucket
	},
	checkReadKey: async (ctx, bucket, key) => {
		// const user = await userFromAuth(ctx);
		// ...validate that the user can read this key
	},
	checkReadBucket: async (ctx, bucket) => {
		// const user = await userFromAuth(ctx);
		// ...validate that the user can read this bucket
	},
	checkDelete: async (ctx, bucket, key) => {
		// const user = await userFromAuth(ctx);
		// ...validate that the user can delete this key
	},
	onUpload: async (ctx, bucket, key) => {
		// ...do something with the key
		// This technically runs in the `syncMetadata` mutation, as the upload
		// is performed from the client side. Will run if using the `useUploadFile`
		// hook, or if `syncMetadata` function is called directly. Runs after the
		// `checkUpload` callback.
		//
		// Note: If you want to associate the newly uploaded file with some other
		// data, like a message, useUploadFile returns the key in the client so you
		// can do it there.
		await ctx.db.insert("image", {
			bucket,
			key,
		});
	},
	// onDelete: async (ctx, bucket, key) => {
	//   // Delete related data from your database, etc.
	//   // Runs after the `checkDelete` callback.
	//   // Alternatively, you could have your own `deleteImage` mutation that calls
	//   // the r2 component's `deleteObject` function.
	//   const image = await ctx.db
	//     .query("image")
	//     .withIndex("bucket_key", (q) => q.eq("bucket", bucket).eq("key", key))
	//     .unique();
	//   if (image) {
	//     await ctx.db.delete(image._id);
	//   }
	// },
	onSyncMetadata: async (ctx, args) => {
		console.log("onSyncMetadata", args);
		const metadata = await r2.getMetadata(ctx, args.key);
		console.log("metadata", metadata);
	},
	callbacks,
});

export const listImages = query({
	args: {},
	handler: async (ctx) => {
		const images = await ctx.db.query("image").collect();
		return Promise.all(
			images.map(async (image) => ({
				...image,
				url: await r2.getUrl(image.key),
			})),
		);
	},
});

export const update = mutation({
	args: {
		image: imageUpdateValidator,
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const { _id, _creationTime, ...updates } = args.image;
		const image = await ctx.db.get(_id);
		if (!image) {
			throw new Error("Image not found");
		}

		return await ctx.db.patch(_id, {
			...updates,
		});
	},
});

export const insertImage = internalMutation({
	args: {
		key: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("image", { key: args.key, bucket: r2.config.bucket });
	},
});

// Insert an image server side (the insertImage mutation is just an example use
// case, not required). When running the example app, you can run `npx convex run
// example:store` (or run it in the dashboard) to insert an image this way.
export const generateAndStoreRandomImage = action({
	handler: async (ctx) => {
		// Download a random image from picsum.photos
		const url = "https://picsum.photos/200/300";
		const response = await fetch(url);
		const blob = await response.blob();
		// This function call is the only required part, it uploads the blob to R2,
		// syncs the metadata, and returns the key.
		const key = await r2.store(ctx, blob);

		await ctx.runMutation(internal.functions.image.insertImage, { key });
	},
});
