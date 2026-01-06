import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const citySchema = z.object({
	name: z.string().min(1, "Name is required"),
	lastVistitedYear: z.number().int().min(1900).max(2100),
	lastVistitedMonth: z.number().int().min(1).max(12),
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});

interface CityFormProps {
	countryId: Id<"country">;
	city?: Doc<"city">;
	onSuccess: () => void;
	onCancel: () => void;
}

export function CityForm({
	countryId,
	city,
	onSuccess,
	onCancel,
}: CityFormProps) {
	const createCity = useMutation(api.functions.city.create);
	const updateCity = useMutation(api.functions.city.update);

	const form = useForm({
		defaultValues: {
			name: city?.name ?? "",
			lastVistitedYear: city?.lastVistitedYear ?? new Date().getFullYear(),
			lastVistitedMonth: city?.lastVistitedMonth ?? new Date().getMonth() + 1,
			lat: city?.lat ?? 0,
			lng: city?.lng ?? 0,
		},
		onSubmit: async ({ value }) => {
			const validated = citySchema.parse(value);
			if (city) {
				await updateCity({
					city: {
						_id: city._id,
						_creationTime: city._creationTime,
						countryId,
						...validated,
					},
				});
			} else {
				await createCity({
					city: {
						countryId,
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
							id="name"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="City name"
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
				<form.Field name="lastVistitedYear">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="lastVistitedYear">Last Visited Year</Label>
							<Input
								id="lastVistitedYear"
								type="number"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								placeholder="2024"
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

				<form.Field name="lastVistitedMonth">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="lastVistitedMonth">Last Visited Month</Label>
							<Input
								id="lastVistitedMonth"
								type="number"
								min={1}
								max={12}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(Number(e.target.value))}
								placeholder="1-12"
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

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="lat">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor="lat">Latitude</Label>
							<Input
								id="lat"
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
								id="lng"
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
							{city ? "Update" : "Create"} City
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
