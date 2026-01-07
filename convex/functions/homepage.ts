import { v } from "convex/values";
import { query } from "../_generated/server";
import { r2 } from "./image";

/**
 * Get up to 10 featured images with their location data resolved.
 * Returns images with URLs and location information (city/place name, countryId, cityId).
 */
export const getFeaturedImages = query({
	args: {},
	handler: async (ctx) => {
		const images = await ctx.db
			.query("image")
			.withIndex("byFeatured", (q) => q.eq("featured", true))
			.take(10);

		const result = await Promise.all(
			images.map(async (image) => {
				const url = await r2.getUrl(image.key);
				let locationName = "";
				let countryId: string | null = null;
				let cityId: string | null = null;
				const imageType = image.location?.imageType ?? null;

				if (image.location) {
					if (image.location.imageType === "city") {
						const city = await ctx.db.get(image.location.locationId);
						if (city) {
							locationName = city.name;
							cityId = city._id;
							countryId = city.countryId;
						}
					} else if (image.location.imageType === "place") {
						const place = await ctx.db.get(image.location.locationId);
						if (place) {
							locationName = place.name;
							const city = await ctx.db.get(place.cityId);
							if (city) {
								cityId = city._id;
								countryId = city.countryId;
								locationName = `${place.name}, ${city.name}`;
							}
						}
					}
				}

				return {
					_id: image._id,
					url,
					description: image.description,
					locationName,
					countryId,
					cityId,
					imageType,
				};
			}),
		);

		// Filter out images without valid location data
		return result.filter((img) => img.countryId && img.cityId);
	},
});

/**
 * Get all countries with their associated cities for map navigation.
 * Returns countries with city arrays including coordinates.
 */
export const getCountriesWithCities = query({
	args: {},
	handler: async (ctx) => {
		const countries = await ctx.db.query("country").collect();
		const cities = await ctx.db.query("city").collect();

		return countries.map((country) => {
			const countryCities = cities.filter(
				(city) => city.countryId === country._id,
			);
			return {
				_id: country._id,
				name: country.name,
				lat: country.lat,
				lng: country.lng,
				cities: countryCities.map((city) => ({
					_id: city._id,
					name: city.name,
					lat: city.lat,
					lng: city.lng,
					lastVisitedYear: city.lastVistitedYear,
					lastVisitedMonth: city.lastVistitedMonth,
				})),
				cityCount: countryCities.length,
			};
		});
	},
});

/**
 * Get the 20 most recently added places with city and country names resolved.
 * Includes iconImage URLs if available.
 */
export const getRecentPlaces = query({
	args: {},
	handler: async (ctx) => {
		// Get all places sorted by creation time (newest first)
		const places = await ctx.db.query("place").order("desc").take(20);

		// Get all cities and countries for resolving names
		const cities = await ctx.db.query("city").collect();
		const countries = await ctx.db.query("country").collect();

		// Create lookup maps
		const cityMap = new Map(cities.map((c) => [c._id, c]));
		const countryMap = new Map(countries.map((c) => [c._id, c]));

		return places.map((place) => {
			const city = cityMap.get(place.cityId);
			const country = city ? countryMap.get(city.countryId) : null;

			return {
				_id: place._id,
				name: place.name,
				category: place.category,
				rating: place.rating,
				description: place.description,
				iconImage: place.iconImage,
				cityId: place.cityId,
				cityName: city?.name ?? "Unknown City",
				countryId: city?.countryId ?? null,
				countryName: country?.name ?? "Unknown Country",
			};
		});
	},
});

