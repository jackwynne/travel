import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const stopSchema = z.object({
	placeId: z.string().min(1, "Place is required"),
	notes: z.string().optional(),
});

const routeSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	stops: z.array(stopSchema).min(1, "At least one stop is required"),
});

interface RouteFormProps {
	cityId: Id<"city">;
	route?: Doc<"route">;
	onSuccess: () => void;
	onCancel: () => void;
}

export function RouteForm({
	cityId,
	route,
	onSuccess,
	onCancel,
}: RouteFormProps) {
	const createRoute = useMutation(api.functions.route.create);
	const updateRoute = useMutation(api.functions.route.update);
	const places = useQuery(api.functions.place.getMany, { cityId });

	const form = useForm({
		defaultValues: {
			name: route?.name ?? "",
			description: route?.description ?? "",
			stops: route?.stops ?? [{ placeId: "", notes: "" }],
		},
		onSubmit: async ({ value }) => {
			const validated = routeSchema.parse({
				...value,
				description: value.description || undefined,
				stops: value.stops.map((stop) => ({
					...stop,
					notes: stop.notes || undefined,
				})),
			});
			if (route) {
				await updateRoute({
					route: {
						_id: route._id,
						_creationTime: route._creationTime,
						city: cityId,
						name: validated.name,
						description: validated.description,
						stops: validated.stops.map((stop) => ({
							placeId: stop.placeId as Id<"place">,
							notes: stop.notes,
						})),
					},
				});
			} else {
				await createRoute({
					route: {
						city: cityId,
						name: validated.name,
						description: validated.description,
						stops: validated.stops.map((stop) => ({
							placeId: stop.placeId as Id<"place">,
							notes: stop.notes,
						})),
					},
				});
			}
			onSuccess();
		},
	});

	const addStop = () => {
		const currentStops = form.getFieldValue("stops");
		form.setFieldValue("stops", [...currentStops, { placeId: "", notes: "" }]);
	};

	const removeStop = (index: number) => {
		const currentStops = form.getFieldValue("stops");
		if (currentStops.length > 1) {
			form.setFieldValue(
				"stops",
				currentStops.filter((_, i) => i !== index),
			);
		}
	};

	if (!places) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

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
							placeholder="Route name"
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

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="description">Description (Optional)</Label>
						<Textarea
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="Describe this route..."
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

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Label>Stops</Label>
					<Button type="button" variant="outline" size="sm" onClick={addStop}>
						<Plus className="size-4 mr-1" />
						Add Stop
					</Button>
				</div>

				<form.Field name="stops" mode="array">
					{(field) => (
						<div className="space-y-3">
							{field.state.value.map((_, index) => (
								<div
									key={index}
									className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30"
								>
									<div className="flex-1 space-y-2">
										<form.Field name={`stops[${index}].placeId`}>
											{(placeField) => (
												<div className="space-y-1">
													<Label className="text-xs">
														Stop {index + 1} - Place
													</Label>
													<Select
														value={placeField.state.value}
														onValueChange={(value) =>
															placeField.handleChange(value)
														}
													>
														<SelectTrigger className="w-full">
															<span className="truncate">
																{placeField.state.value
																	? (places.find(
																			(p) => p._id === placeField.state.value,
																		)?.name ?? "Select a place")
																	: "Select a place"}
															</span>
														</SelectTrigger>
														<SelectContent>
															{places.map((place) => (
																<SelectItem key={place._id} value={place._id}>
																	{place.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											)}
										</form.Field>

										<form.Field name={`stops[${index}].notes`}>
											{(notesField) => (
												<div className="space-y-1">
													<Label className="text-xs">Notes (Optional)</Label>
													<Input
														value={notesField.state.value ?? ""}
														onBlur={notesField.handleBlur}
														onChange={(e) =>
															notesField.handleChange(e.target.value)
														}
														placeholder="Notes for this stop..."
														className="text-sm"
													/>
												</div>
											)}
										</form.Field>
									</div>

									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={() => removeStop(index)}
										disabled={field.state.value.length <= 1}
										title="Remove stop"
										className="mt-6"
									>
										<Trash2 className="size-4" />
									</Button>
								</div>
							))}
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
							{route ? "Update" : "Create"} Route
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
