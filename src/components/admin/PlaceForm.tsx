import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const PLACE_CATEGORIES = [
	"gallery+museum",
	"park",
	"restaurant",
	"cafe+bakery+snacks",
	"bar+pub+club",
	"rooftop_bar",
	"hotel",
	"theatre+concert_hall+venue",
	"landmark+church+view",
	"other",
] as const;

type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

const placeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	category: z.enum(PLACE_CATEGORIES),
	description: z.string().optional(),
	rating: z.number().min(0).max(5).optional(),
	notes: z.string().optional(),
	iconImage: z.string().optional(),
	lat: z.number().optional(),
	lng: z.number().optional(),
});

interface PlaceFormProps {
	cityId: Id<"city">;
	place?: Doc<"place">;
	onSuccess: () => void;
	onCancel: () => void;
}

export function PlaceForm({
	cityId,
	place,
	onSuccess,
	onCancel,
}: PlaceFormProps) {
	const createPlace = useMutation(api.functions.place.create);
	const updatePlace = useMutation(api.functions.place.update);

	const form = useForm({
		defaultValues: {
			name: place?.name ?? "",
			category: (place?.category ?? "other") as PlaceCategory,
			description: place?.description ?? "",
			rating: place?.rating ?? undefined,
			notes: place?.notes ?? "",
			iconImage: place?.iconImage ?? "",
			lat: place?.lat ?? 0,
			lng: place?.lng ?? 0,
		},
		onSubmit: async ({ value }) => {
			const validated = placeSchema.parse({
				...value,
				rating: value.rating || undefined,
				notes: value.notes || undefined,
			});
			if (place) {
				await updatePlace({
					place: {
						_id: place._id,
						_creationTime: place._creationTime,
						cityId,
						...validated,
					},
				});
			} else {
				await createPlace({
					place: {
						cityId,
						...validated,
					},
				});
			}
			onSuccess();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="name">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Place name"
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

			<form.Field name="category">
				{(field) => {
					const formatCategory = (category: string) => {
						const parts = category
							.split("+")
							.map(
								(part) =>
									part.replace(/_/g, " ").charAt(0).toUpperCase() +
									part.replace(/_/g, " ").slice(1),
							);
						return parts.length === 1
							? parts[0]
							: `${parts.slice(0, -1).join(", ")} or ${parts.at(-1)}`;
					};

					return (
						<div className="space-y-2">
							<Label>Category</Label>
							<Select
								value={field.state.value}
								onValueChange={(value) =>
									field.handleChange(value as PlaceCategory)
								}
							>
								<SelectTrigger className="w-full">
									<SelectValue>
										{field.state.value && formatCategory(field.state.value)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{PLACE_CATEGORIES.map((category) => (
										<SelectItem key={category} value={category}>
											{formatCategory(category)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
						</div>
					);
				}}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="description">Description (Optional)</Label>
						<Textarea
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Describe this place..."
							rows={3}
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

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="rating">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="rating">Rating (0-5)</Label>
							<Input
								type="number"
								min={0}
								max={5}
								step={0.5}
								value={field.state.value ?? ""}
								onBlur={field.handleBlur}
								onChange={(e) =>
									field.handleChange(
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								placeholder="Optional"
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="iconImage">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="iconImage">Icon Image (Optional)</Label>
							<Input
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Icon URL or emoji"
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

			<form.Field name="notes">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Any additional notes..."
							rows={2}
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
								type="number"
								step="any"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
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
								type="number"
								step="any"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
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
							{place ? "Update" : "Create"} Place
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
