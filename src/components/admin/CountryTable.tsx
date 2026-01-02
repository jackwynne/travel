import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { Edit, Trash2, ChevronRight, Plus } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
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
import { CountryForm } from "./CountryForm";

export function CountryTable() {
	const countries = useQuery(api.functions.country.getMany);
	const removeCountry = useMutation(api.functions.country.remove);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCountry, setEditingCountry] = useState<Doc<"country"> | undefined>();
	const [deletingCountry, setDeletingCountry] = useState<Doc<"country"> | undefined>();

	const handleEdit = (country: Doc<"country">) => {
		setEditingCountry(country);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setEditingCountry(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingCountry(undefined);
	};

	const handleDelete = async () => {
		if (deletingCountry) {
			await removeCountry({ id: deletingCountry._id });
			setDeletingCountry(undefined);
		}
	};

	if (!countries) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Countries</h2>
				<Button onClick={handleCreate} size="sm">
					<Plus className="size-4 mr-1" />
					Add Country
				</Button>
			</div>

			{countries.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No countries yet. Add your first country to get started.</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Latitude</TableHead>
							<TableHead>Longitude</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{countries.map((country) => (
							<TableRow key={country._id}>
								<TableCell>
									<Link
										to="/admin/country/$countryId"
										params={{ countryId: country._id }}
										className="flex items-center gap-2 font-medium hover:text-primary transition-colors"
									>
										{country.name}
										<ChevronRight className="size-4" />
									</Link>
								</TableCell>
								<TableCell>{country.lat.toFixed(4)}</TableCell>
								<TableCell>{country.lng.toFixed(4)}</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => handleEdit(country)}
										>
											<Edit className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeletingCountry(country)}
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
						<DialogTitle>
							{editingCountry ? "Edit Country" : "Add Country"}
						</DialogTitle>
						<DialogDescription>
							{editingCountry
								? "Update the country details below."
								: "Enter the details for the new country."}
						</DialogDescription>
					</DialogHeader>
					<CountryForm
						country={editingCountry}
						onSuccess={handleFormSuccess}
						onCancel={() => setIsFormOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deletingCountry}
				onOpenChange={(open) => !open && setDeletingCountry(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Country</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deletingCountry?.name}"? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeletingCountry(undefined)}>
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

