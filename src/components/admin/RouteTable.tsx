import { useMutation, useQuery } from "convex/react";
import { Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { RouteForm } from "./RouteForm";

interface RouteTableProps {
	cityId: Id<"city">;
}

export function RouteTable({ cityId }: RouteTableProps) {
	const routes = useQuery(api.functions.route.getMany, { cityId });
	const places = useQuery(api.functions.place.getMany, { cityId });
	const removeRoute = useMutation(api.functions.route.remove);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingRoute, setEditingRoute] = useState<Doc<"route"> | undefined>();
	const [deletingRoute, setDeletingRoute] = useState<
		Doc<"route"> | undefined
	>();

	const handleEdit = (route: Doc<"route">) => {
		setEditingRoute(route);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setEditingRoute(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingRoute(undefined);
	};

	const handleDelete = async () => {
		if (deletingRoute) {
			await removeRoute({ id: deletingRoute._id });
			setDeletingRoute(undefined);
		}
	};

	if (!routes || !places) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Routes</h2>
				<Button onClick={handleCreate} size="sm">
					<Plus className="size-4 mr-1" />
					Add Route
				</Button>
			</div>

			{routes.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No routes yet. Add your first route to get started.</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Stops</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{routes.map((route) => (
							<TableRow key={route._id}>
								<TableCell className="font-medium">{route.name}</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<MapPin className="size-4 text-muted-foreground" />
										<Badge variant="secondary">
											{route.stops.length}{" "}
											{route.stops.length === 1 ? "stop" : "stops"}
										</Badge>
									</div>
								</TableCell>
								<TableCell className="max-w-[200px] truncate">
									{route.description ?? (
										<span className="text-muted-foreground">—</span>
									)}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => handleEdit(route)}
											title="Edit route"
										>
											<Edit className="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeletingRoute(route)}
											title="Delete route"
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
						<DialogTitle>
							{editingRoute ? "Edit Route" : "Add Route"}
						</DialogTitle>
						<DialogDescription>
							{editingRoute
								? "Update the route details below."
								: "Enter the details for the new route."}
						</DialogDescription>
					</DialogHeader>
					<RouteForm
						cityId={cityId}
						route={editingRoute}
						onSuccess={handleFormSuccess}
						onCancel={() => setIsFormOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deletingRoute}
				onOpenChange={(open) => !open && setDeletingRoute(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Route</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deletingRoute?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeletingRoute(undefined)}
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
