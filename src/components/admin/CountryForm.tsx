import { useForm } from "@tanstack/react-form";
import { useMutation } from "convex/react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

const countrySchema = z.object({
	name: z.string().min(1, "Name is required"),
	lat: z.number().min(-90).max(90),
	lng: z.number().min(-180).max(180),
});

interface CountryFormProps {
	country?: Doc<"country">;
	onSuccess: () => void;
	onCancel: () => void;
}

export function CountryForm({
	country,
	onSuccess,
	onCancel,
}: CountryFormProps) {
	const createCountry = useMutation(api.functions.country.create);
	const updateCountry = useMutation(api.functions.country.update);

	const form = useForm({
		defaultValues: {
			name: country?.name ?? "",
			lat: country?.lat ?? 0,
			lng: country?.lng ?? 0,
		},
		onSubmit: async ({ value }) => {
			const validated = countrySchema.parse(value);
			if (country) {
				await updateCountry({
					country: {
						_id: country._id,
						_creationTime: country._creationTime,
						...validated,
					},
				});
			} else {
				await createCountry({ country: validated });
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
							placeholder="Country name"
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
							{country ? "Update" : "Create"} Country
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
