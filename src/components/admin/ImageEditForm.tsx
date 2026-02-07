import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const imageSchema = z.object({
	description: z.string().optional(),
	lat: z.number().min(-90).max(90).optional(),
	lng: z.number().min(-180).max(180).optional(),
	dateTime: z.number().optional(),
	featured: z.boolean().optional(),
});

type ImageWithUrl = {
	_id: Id<"image">;
	_creationTime: number;
	bucket: string;
	key: string;
	dateTime?: number;
	lat?: number;
	lng?: number;
	description?: string;
	iconImage?: string;
	featured?: boolean;
	location?: {
		imageType: "place" | "city" | "concert";
		locationId: Id<"place"> | Id<"city"> | Id<"concert">;
	};
	url: string | null;
};

interface ImageEditFormProps {
	image: ImageWithUrl;
	onSuccess: () => void;
	onCancel: () => void;
}

export function ImageEditForm({
	image,
	onSuccess,
	onCancel,
}: ImageEditFormProps) {
	const updateImage = useMutation(api.functions.image.update);

	const form = useForm({
		defaultValues: {
			description: image.description ?? "",
			lat: image.lat ?? undefined,
			lng: image.lng ?? undefined,
			dateTime: image.dateTime ?? undefined,
			featured: image.featured ?? false,
		},
		onSubmit: async ({ value }) => {
			const validated = imageSchema.parse({
				description: value.description || undefined,
				lat: value.lat,
				lng: value.lng,
				dateTime: value.dateTime,
				featured: value.featured,
			});

			await updateImage({
				image: {
					_id: image._id,
					_creationTime: image._creationTime,
					bucket: image.bucket,
					key: image.key,
					description: validated.description,
					lat: validated.lat,
					lng: validated.lng,
					dateTime: validated.dateTime,
					featured: validated.featured,
					iconImage: image.iconImage,
					location: image.location,
				},
			});
			onSuccess();
		},
	});

	const formatDateTimeForInput = (timestamp?: number) => {
		if (!timestamp) return "";
		const date = new Date(timestamp);
		// Format as YYYY-MM-DDTHH:mm for datetime-local input
		return date.toISOString().slice(0, 16);
	};

	const parseDateTimeFromInput = (value: string): number | undefined => {
		if (!value) return undefined;
		const date = new Date(value);
		return date.getTime();
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			{/* Preview */}
			{(image.iconImage || image.url) && (
				<div className="space-y-2">
					<Label>Preview</Label>
					<img
						src={image.iconImage || image.url || ""}
						alt="Image preview"
						className="h-32 w-auto rounded-md border object-contain"
					/>
				</div>
			)}

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Describe this image..."
							rows={3}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="dateTime">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="dateTime">Capture Date/Time</Label>
						<Input
							id="dateTime"
							type="datetime-local"
							value={formatDateTimeForInput(field.state.value)}
							onBlur={field.handleBlur}
							onChange={(e) =>
								field.handleChange(parseDateTimeFromInput(e.target.value))
							}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="featured">
				{(field) => (
					<div className="flex items-center justify-between rounded-lg border p-3">
						<div className="space-y-0.5">
							<Label htmlFor="featured">Featured Image</Label>
							<p className="text-sm text-muted-foreground">
								Display this image on the homepage
							</p>
						</div>
						<Switch
							id="featured"
							checked={field.state.value}
							onCheckedChange={(checked) => field.handleChange(checked)}
						/>
					</div>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="lat">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="lat">Latitude</Label>
							<Input
								id="lat"
								type="number"
								step="any"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								placeholder="-90 to 90"
							/>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
						</div>
					)}
				</form.Field>

				<form.Field name="lng">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="lng">Longitude</Label>
							<Input
								id="lng"
								type="number"
								step="any"
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								placeholder="-180 to 180"
							/>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
						</div>
					)}
				</form.Field>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting}>
							Update Image
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
