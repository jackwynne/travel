import * as avif from "@jsquash/avif";
import * as jpeg from "@jsquash/jpeg";
import * as png from "@jsquash/png";
import { default as resizeImage } from "@jsquash/resize";
import ExifReader from "exifreader";

export interface ExifData {
	lat: number | null;
	lng: number | null;
	dateTime: number | null; // Unix timestamp in milliseconds
}

/**
 * Extract EXIF metadata from an image file
 * Returns GPS coordinates and capture datetime if available
 */
export async function extractExifData(
	fileBuffer: ArrayBuffer,
): Promise<ExifData> {
	try {
		const tags = ExifReader.load(fileBuffer, { expanded: true });

		// Extract GPS coordinates
		let lat: number | null = null;
		let lng: number | null = null;

		if (tags.gps?.Latitude && tags.gps?.Longitude) {
			lat = tags.gps.Latitude;
			lng = tags.gps.Longitude;
		}

		// Extract datetime - try DateTimeOriginal first, then DateTime
		let dateTime: number | null = null;

		const dateTimeOriginal = tags.exif?.DateTimeOriginal?.description;
		const dateTimeTag = tags.exif?.DateTime?.description;
		const dateString = dateTimeOriginal || dateTimeTag;

		if (dateString) {
			// EXIF datetime format is "YYYY:MM:DD HH:MM:SS"
			// Convert to standard format "YYYY-MM-DD HH:MM:SS"
			const normalizedDate = dateString.replace(
				/^(\d{4}):(\d{2}):(\d{2})/,
				"$1-$2-$3",
			);
			const parsedDate = new Date(normalizedDate);
			if (!Number.isNaN(parsedDate.getTime())) {
				dateTime = parsedDate.getTime();
			}
		}

		return { lat, lng, dateTime };
	} catch (error) {
		console.warn("Failed to extract EXIF data:", error);
		return { lat: null, lng: null, dateTime: null };
	}
}

/**
 * Create a low-resolution AVIF thumbnail from an image file
 * Returns a base64 data URL string
 */
export async function createThumbnail(
	file: File,
	maxWidth = 480,
	maxHeight = 854,
): Promise<string> {
	const type = file.type.split("/")[1];
	const arrayBuffer = await file.arrayBuffer();

	// Decode the image
	const imageData = await decode(type === "jpg" ? "jpeg" : type, arrayBuffer);
	if (!imageData) {
		throw new Error("Failed to decode image for thumbnail");
	}

	// Calculate dimensions maintaining aspect ratio
	const aspectRatio = imageData.width / imageData.height;
	let targetWidth = maxWidth;
	let targetHeight = maxHeight;

	if (aspectRatio > maxWidth / maxHeight) {
		// Image is wider - constrain by width
		targetHeight = Math.round(maxWidth / aspectRatio);
	} else {
		// Image is taller - constrain by height
		targetWidth = Math.round(maxHeight * aspectRatio);
	}

	// Resize the image
	const resizedImageData = await resize(imageData, targetHeight, targetWidth);

	// Encode as AVIF
	const imageBuffer = await encode("avif", resizedImageData);
	const imageBlob = new Blob([imageBuffer], { type: "image/avif" });

	// Convert to base64
	const base64String = (await blobToBase64(imageBlob)) as string;
	return base64String;
}

export async function decode(sourceType: string, fileBuffer: ArrayBuffer) {
	switch (sourceType) {
		case "avif":
			return await avif.decode(fileBuffer);
		case "jpeg":
			return await jpeg.decode(fileBuffer);
		case "png":
			return await png.decode(fileBuffer);
		default:
			throw new Error(`Unknown source type: ${sourceType}`);
	}
}

export async function encode(outputType: string, imageData: ImageData) {
	switch (outputType) {
		case "avif":
			return await avif.encode(imageData);
		case "jpeg":
			return await jpeg.encode(imageData);
		case "png":
			return await png.encode(imageData);
		default:
			throw new Error(`Unknown output type: ${outputType}`);
	}
}

export async function convert(
	sourceType: string,
	outputType: string,
	fileBuffer: ArrayBuffer,
) {
	const imageData = await decode(sourceType, fileBuffer);
	if (imageData === null) {
		throw new Error(`Failed to decode image from type: ${sourceType}`);
	}
	return encode(outputType, imageData);
}

export async function resize(
	imageData: ImageData,
	height: number,
	width: number,
) {
	return await resizeImage(imageData, {
		height: height,
		width: width,
		fitMethod: "contain",
	});
}

export function blobToBase64(blob: Blob) {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.readAsDataURL(blob);
	});
}
