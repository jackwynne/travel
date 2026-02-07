import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
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

const parseLines = (value: string) =>
	value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

const concertSchema = z.object({
	title: z.string().min(1, "Title is required"),
	placeId: z.string().min(1, "Venue is required"),
	dateTime: z.string().optional(),
	performers: z
		.string()
		.refine((value) => parseLines(value).length > 0, {
			message: "Add at least one performer",
		}),
	setlist: z
		.string()
		.refine((value) => parseLines(value).length > 0, {
			message: "Add at least one setlist item",
		}),
	notes: z.string().optional(),
});

function timestampToDatetimeLocal(ms: number | undefined): string {
	if (!ms) return "";
	const date = new Date(ms);
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalToTimestamp(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

interface ConcertFormProps {
	concert?: Doc<"concert">;
	onSuccess: () => void;
	onCancel: () => void;
}

export function ConcertForm({
	concert,
	onSuccess,
	onCancel,
}: ConcertFormProps) {
	const createConcert = useMutation(api.functions.concert.create);
	const updateConcert = useMutation(api.functions.concert.update);
	const places = useQuery(api.functions.place.getMany, {});

	const form = useForm({
		defaultValues: {
			title: concert?.title ?? "",
			placeId: concert?.placeId ?? "",
			dateTime: timestampToDatetimeLocal(concert?.dateTime),
			performers: concert?.performers?.join("\n") ?? "",
			setlist: concert?.setlist?.join("\n") ?? "",
			notes: concert?.notes ?? "",
		},
		onSubmit: async ({ value }) => {
			const validated = concertSchema.parse({
				...value,
				notes: value.notes || undefined,
			});

			const payload = {
				placeId: validated.placeId as Id<"place">,
				title: validated.title,
				dateTime: datetimeLocalToTimestamp(validated.dateTime),
				performers: parseLines(validated.performers),
				setlist: parseLines(validated.setlist),
				notes: validated.notes,
			};

			if (concert) {
				await updateConcert({
					concert: {
						_id: concert._id,
						_creationTime: concert._creationTime,
						...payload,
					},
				});
			} else {
				await createConcert({
					concert: payload,
				});
			}

			onSuccess();
		},
	});

	if (!places) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	if (places.length === 0) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Add a place first so you can link concerts to a venue.
				</p>
				<div className="flex justify-end">
					<Button type="button" variant="outline" onClick={onCancel}>
						Close
					</Button>
				</div>
			</div>
		);
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="title">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="title">Concert Title</Label>
						<Input
							id="title"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="e.g. Summer Chamber Recital"
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

			<form.Field name="placeId">
				{(field) => (
					<div className="space-y-2">
						<Label>Venue</Label>
						<Select
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value)}
						>
							<SelectTrigger className="w-full">
								<span className="truncate">
									{field.state.value
										? places.find((place) => place._id === field.state.value)
												?.name ?? "Select a venue"
										: "Select a venue"}
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
						{field.state.meta.isTouched &&
							field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
					</div>
				)}
			</form.Field>

			<form.Field name="dateTime">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="dateTime">Date & Time (Optional)</Label>
						<Input
							id="dateTime"
							type="datetime-local"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="performers">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="performers">Performers</Label>
						<Textarea
							id="performers"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="One performer per line"
							rows={4}
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

			<form.Field name="setlist">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="setlist">Setlist / Pieces Played</Label>
						<Textarea
							id="setlist"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="One piece per line"
							rows={5}
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

			<form.Field name="notes">
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea
							id="notes"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(event) => field.handleChange(event.target.value)}
							placeholder="Encore notes, impressions, etc."
							rows={3}
						/>
					</div>
				)}
			</form.Field>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button type="submit" disabled={isSubmitting}>
							{concert ? "Update" : "Create"} Concert
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
