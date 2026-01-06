import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { CityForm } from "./CityForm";

interface CityTableProps {
	countryId: Id<"country">;
}

export function CityTable({ countryId }: CityTableProps) {
	const cities = useQuery(api.functions.city.getMany, { countryId });
	const removeCity = useMutation(api.functions.city.remove);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCity, setEditingCity] = useState<Doc<"city"> | undefined>();
	const [deletingCity, setDeletingCity] = useState<Doc<"city"> | undefined>();

	const handleEdit = (city: Doc<"city">) => {
		setEditingCity(city);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setEditingCity(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingCity(undefined);
	};

	const handleDelete = async () => {
		if (deletingCity) {
			await removeCity({ id: deletingCity._id });
			setDeletingCity(undefined);
		}
	};

	const formatMonth = (month: number) => {
		const date = new Date(2000, month - 1);
		return date.toLocaleString("default", { month: "short" });
	};

	if (!cities) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Cities</h2>
				<Button onClick={handleCreate} size="sm">
					<Plus className="size-4 mr-1" />
					Add City
				</Button>
			</div>

			{cities.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No cities yet. Add your first city to get started.</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Last Visited</TableHead>
							<TableHead>Latitude</TableHead>
							<TableHead>Longitude</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{cities.map((city) => (
							<TableRow key={city._id}>
								<TableCell>
									<Link
										to="/admin/country/$countryId/city/$cityId"
										params={{ countryId, cityId: city._id }}
										className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
									>
										{city.name}
										<ChevronRight className="size-4" />
									</Link>
								</TableCell>
								<TableCell>
									{formatMonth(city.lastVistitedMonth)} {city.lastVistitedYear}
								</TableCell>
								<TableCell>{city.lat.toFixed(4)}</TableCell>
								<TableCell>{city.lng.toFixed(4)}</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => handleEdit(city)}
										>
											<Edit className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeletingCity(city)}
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
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingCity ? "Edit City" : "Add City"}</DialogTitle>
						<DialogDescription>
							{editingCity
								? "Update the city details below."
								: "Enter the details for the new city."}
						</DialogDescription>
					</DialogHeader>
					<CityForm
						countryId={countryId}
						city={editingCity}
						onSuccess={handleFormSuccess}
						onCancel={() => setIsFormOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deletingCity}
				onOpenChange={(open) => !open && setDeletingCity(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete City</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deletingCity?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeletingCity(undefined)}
						>
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
