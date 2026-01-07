import { useUploadFile } from "@convex-dev/r2/react";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	createThumbnail,
	type ExifData,
	extractExifData,
} from "@/lib/image-utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface CityImageUploadFormProps {
	cityId: Id<"city">;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface ProcessedImageData {
	file: File;
	preview: string;
	exifData: ExifData;
	thumbnail: string;
}

export function CityImageUploadForm({
	cityId,
	onSuccess,
	onCancel,
}: CityImageUploadFormProps) {
	const imageInput = useRef<HTMLInputElement>(null);
	const [processedImage, setProcessedImage] =
		useState<ProcessedImageData | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedKey, setUploadedKey] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const uploadFile = useUploadFile(api.functions.image);
	const updateImage = useMutation(api.functions.image.update);

	// Query for the image by key after upload
	const uploadedImage = useQuery(
		api.functions.image.getByKey,
		uploadedKey ? { key: uploadedKey } : "skip",
	);

	const handleFileChange = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			setError(null);
			setIsProcessing(true);

			try {
				// Create a preview URL
				const preview = URL.createObjectURL(file);

				// Extract EXIF data
				const arrayBuffer = await file.arrayBuffer();
				const exifData = await extractExifData(arrayBuffer);

				// Create thumbnail
				const thumbnail = await createThumbnail(file);

				setProcessedImage({
					file,
					preview,
					exifData,
					thumbnail,
				});
			} catch (err) {
				console.error("Error processing image:", err);
				setError(
					err instanceof Error ? err.message : "Failed to process image",
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[],
	);

	const handleUpload = useCallback(async () => {
		if (!processedImage) return;

		setError(null);
		setIsUploading(true);

		try {
			// Upload to R2 - this returns the key
			const key = await uploadFile(processedImage.file);
			setUploadedKey(key);
		} catch (err) {
			console.error("Error uploading image:", err);
			setError(err instanceof Error ? err.message : "Failed to upload image");
			setIsUploading(false);
		}
	}, [processedImage, uploadFile]);

	// Effect to update the image record once we have the image from the query
	const handleUpdateImage = useCallback(async () => {
		if (!uploadedImage || !processedImage) return;

		try {
			await updateImage({
				image: {
					_id: uploadedImage._id,
					_creationTime: uploadedImage._creationTime,
					bucket: uploadedImage.bucket,
					key: uploadedImage.key,
					dateTime: processedImage.exifData.dateTime ?? undefined,
					lat: processedImage.exifData.lat ?? undefined,
					lng: processedImage.exifData.lng ?? undefined,
					iconImage: processedImage.thumbnail,
					location: {
						imageType: "city" as const,
						locationId: cityId,
					},
				},
			});

			// Clean up
			if (processedImage.preview) {
				URL.revokeObjectURL(processedImage.preview);
			}

			setProcessedImage(null);
			setUploadedKey(null);
			setIsUploading(false);

			if (imageInput.current) {
				imageInput.current.value = "";
			}

			onSuccess?.();
		} catch (err) {
			console.error("Error updating image:", err);
			setError(
				err instanceof Error ? err.message : "Failed to update image metadata",
			);
			setIsUploading(false);
		}
	}, [uploadedImage, processedImage, updateImage, cityId, onSuccess]);

	// Trigger update when image is found after upload
	if (uploadedImage && isUploading) {
		handleUpdateImage();
	}

	const handleReset = useCallback(() => {
		if (processedImage?.preview) {
			URL.revokeObjectURL(processedImage.preview);
		}
		setProcessedImage(null);
		setUploadedKey(null);
		setError(null);
		if (imageInput.current) {
			imageInput.current.value = "";
		}
	}, [processedImage]);

	const formatDateTime = (timestamp: number | null) => {
		if (!timestamp) return "Not available";
		return new Date(timestamp).toLocaleString();
	};

	const formatCoordinate = (value: number | null, type: "lat" | "lng") => {
		if (value === null) return "Not available";
		const direction =
			type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
		return `${Math.abs(value).toFixed(6)}° ${direction}`;
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="image">Select Image</Label>
				<Input
					id="image"
					type="file"
					accept="image/jpeg,image/png,image/avif"
					ref={imageInput}
					onChange={handleFileChange}
					disabled={isProcessing || isUploading}
				/>
			</div>

			{error && (
				<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{isProcessing && (
				<div className="text-sm text-muted-foreground">Processing image...</div>
			)}

			{processedImage && (
				<div className="space-y-4">
					{/* Preview */}
					<div className="space-y-2">
						<Label>Preview</Label>
						<div className="flex gap-4">
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground">Original</p>
								<img
									src={processedImage.preview}
									alt="Preview"
									className="h-32 w-auto rounded-md border object-contain"
								/>
							</div>
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground">Thumbnail</p>
								<img
									src={processedImage.thumbnail}
									alt="Thumbnail"
									className="h-32 w-auto rounded-md border object-contain"
								/>
							</div>
						</div>
					</div>

					{/* Extracted Metadata */}
					<div className="space-y-2">
						<Label>Extracted Metadata</Label>
						<div className="rounded-md border p-3 text-sm">
							<div className="grid grid-cols-2 gap-2">
								<div>
									<span className="text-muted-foreground">Capture Time:</span>
									<p className="font-medium">
										{formatDateTime(processedImage.exifData.dateTime)}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">Location:</span>
									<p className="font-medium">
										{processedImage.exifData.lat !== null &&
										processedImage.exifData.lng !== null
											? `${formatCoordinate(processedImage.exifData.lat, "lat")}, ${formatCoordinate(processedImage.exifData.lng, "lng")}`
											: "Not available"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4">
						{onCancel && (
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isUploading}
							>
								Cancel
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							onClick={handleReset}
							disabled={isUploading}
						>
							Clear
						</Button>
						<Button type="button" onClick={handleUpload} disabled={isUploading}>
							{isUploading ? "Uploading..." : "Upload Image"}
						</Button>
					</div>
				</div>
			)}

			{!processedImage && onCancel && (
				<div className="flex justify-end pt-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			)}
		</div>
	);
}

