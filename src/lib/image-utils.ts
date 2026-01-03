import * as avif from "@jsquash/avif";
import * as jpeg from "@jsquash/jpeg";
import * as png from "@jsquash/png";
import { default as resizeImage } from "@jsquash/resize";

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
