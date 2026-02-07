import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Edit, Images, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { ConcertForm } from "./ConcertForm";

export function ConcertTable() {
	const concerts = useQuery(api.functions.concert.getMany, {});
	const places = useQuery(api.functions.place.getMany, {});
	const cities = useQuery(api.functions.city.getMany, {});
	const removeConcert = useMutation(api.functions.concert.remove);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingConcert, setEditingConcert] = useState<
		Doc<"concert"> | undefined
	>();
	const [deletingConcert, setDeletingConcert] = useState<
		Doc<"concert"> | undefined
	>();

	const placeMap = useMemo(() => {
		if (!places) return new Map();
		return new Map(places.map((place) => [place._id, place]));
	}, [places]);

	const cityMap = useMemo(() => {
		if (!cities) return new Map();
		return new Map(cities.map((city) => [city._id, city]));
	}, [cities]);

	const handleEdit = (concert: Doc<"concert">) => {
		setEditingConcert(concert);
		setIsFormOpen(true);
	};

	const handleCreate = () => {
		setEditingConcert(undefined);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingConcert(undefined);
	};

	const handleDelete = async () => {
		if (deletingConcert) {
			await removeConcert({ id: deletingConcert._id });
			setDeletingConcert(undefined);
		}
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "—";
		return new Date(timestamp).toLocaleString();
	};

	const formatListPreview = (items: string[], limit = 2) => {
		if (items.length === 0) return "—";
		const visible = items.slice(0, limit).join(", ");
		const remaining = items.length - limit;
		return remaining > 0 ? `${visible} +${remaining}` : visible;
	};

	if (
		concerts === undefined ||
		places === undefined ||
		cities === undefined
	) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Concerts</h2>
				<Button onClick={handleCreate} size="sm">
					<Plus className="size-4 mr-1" />
					Add Concert
				</Button>
			</div>

			{concerts.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No concerts yet. Add your first performance.</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Concert</TableHead>
							<TableHead>Venue</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Performers</TableHead>
							<TableHead>Setlist</TableHead>
							<TableHead className="w-[120px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{concerts.map((concert) => {
							const place = placeMap.get(concert.placeId);
							const city = place ? cityMap.get(place.cityId) : null;
							const venueLabel = place
								? `${place.name}${city ? ` · ${city.name}` : ""}`
								: "Unknown venue";

							return (
								<TableRow key={concert._id}>
									<TableCell className="font-medium">
										<div>{concert.title}</div>
										{concert.notes && (
											<div className="text-xs text-muted-foreground truncate max-w-[220px]">
												{concert.notes}
											</div>
										)}
									</TableCell>
									<TableCell>
										<Badge variant="secondary" className="font-normal">
											{venueLabel}
										</Badge>
									</TableCell>
									<TableCell>{formatDate(concert.dateTime)}</TableCell>
									<TableCell>
										{formatListPreview(concert.performers)}
									</TableCell>
									<TableCell>
										{concert.setlist.length > 0 ? (
											<span className="text-sm">
												{concert.setlist.length} items
											</span>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleEdit(concert)}
												title="Edit concert"
											>
												<Edit className="size-4" />
											</Button>
											<Link
												to="/admin/concerts/$concertId"
												params={{ concertId: concert._id as string }}
												className={cn(
													buttonVariants({ variant: "ghost", size: "icon-sm" }),
												)}
												title="Manage images"
											>
												<Images className="size-4" />
											</Link>
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => setDeletingConcert(concert)}
												title="Delete concert"
											>
												<Trash2 className="size-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			)}

			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{editingConcert ? "Edit Concert" : "Add Concert"}
						</DialogTitle>
						<DialogDescription>
							{editingConcert
								? "Update the concert details below."
								: "Enter the details for the new concert."}
						</DialogDescription>
					</DialogHeader>
					<ConcertForm
						concert={editingConcert}
						onSuccess={handleFormSuccess}
						onCancel={() => setIsFormOpen(false)}
					/>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!deletingConcert}
				onOpenChange={(open) => !open && setDeletingConcert(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Concert</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{deletingConcert?.title}"?
							This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeletingConcert(undefined)}
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
