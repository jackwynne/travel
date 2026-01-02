import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Edit, Trash2, Plus, Star } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { PlaceForm } from "./PlaceForm";

interface PlaceTableProps {
	cityId: Id<"city">;
}

export function PlaceTable({ cityId }: PlaceTableProps) {
	const places = useQuery(api.functions.place.getMany, { cityId });
	const removePlace = useMutation(api.functions.place.remove);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingPlace, setEditingPlace] = useState<Doc<"place"> | undefined>();
	const [deletingPlace, setDeletingPlace] = useState<Doc<"place"> | undefined>();

	const handleEdit = (place: Doc<"place">) => {
		setEditingPlace(place);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setEditingPlace(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingPlace(undefined);
	};

	const handleDelete = async () => {
		if (deletingPlace) {
			await removePlace({ id: deletingPlace._id });
			setDeletingPlace(undefined);
		}
	};

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			gallery: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
			library: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
			museum: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
			park: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
			restaurant: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
			cafe: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
			bar: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
			theatre: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
			other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
		};
		return colors[category] || colors.other;
	};

	if (!places) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Places</h2>
				<Button onClick={handleCreate} size="sm">
					<Plus className="size-4 mr-1" />
					Add Place
				</Button>
			</div>

			{places.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No places yet. Add your first place to get started.</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Rating</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{places.map((place) => (
							<TableRow key={place._id}>
								<TableCell className="font-medium">{place.name}</TableCell>
								<TableCell>
									<Badge
										variant="secondary"
										className={getCategoryColor(place.category)}
									>
										{place.category}
									</Badge>
								</TableCell>
								<TableCell>
									{place.rating !== undefined ? (
										<span className="flex items-center gap-1">
											<Star className="size-4 fill-yellow-400 text-yellow-400" />
											{place.rating.toFixed(1)}
										</span>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</TableCell>
								<TableCell className="max-w-[200px] truncate">
									{place.description}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => handleEdit(place)}
										>
											<Edit className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeletingPlace(place)}
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			{/* Create/Edit Dialog */}
			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingPlace ? "Edit Place" : "Add Place"}</DialogTitle>
						<DialogDescription>
							{editingPlace
								? "Update the place details below."
								: "Enter the details for the new place."}
						</DialogDescription>
					</DialogHeader>
					<PlaceForm
						cityId={cityId}
						place={editingPlace}
						onSuccess={handleFormSuccess}
						onCancel={() => setIsFormOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deletingPlace}
				onOpenChange={(open) => !open && setDeletingPlace(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Place</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deletingPlace?.name}"? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeletingPlace(undefined)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

