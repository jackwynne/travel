import { useMutation, useQuery } from "convex/react";
import { Edit, ImageIcon, ImagePlus, MapPin, Trash2 } from "lucide-react";
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
import type { Id } from "../../../convex/_generated/dataModel";
import { ImageEditForm } from "./ImageEditForm";
import { PlaceImageUploadForm } from "./PlaceImageUploadForm";

type ImageWithUrl = {
	_id: Id<"image">;
	_creationTime: number;
	bucket: string;
	key: string;
	dateTime?: number;
	lat?: number;
	lng?: number;
	description?: string;
	iconImage?: string;
	featured?: boolean;
	location?: {
		imageType: "place" | "city";
		locationId: Id<"place"> | Id<"city">;
	};
	url: string | null;
};

interface ImageTableProps {
	placeId: Id<"place">;
}

export function ImageTable({ placeId }: ImageTableProps) {
	const images = useQuery(api.functions.image.getByPlace, { placeId });
	const removeImage = useMutation(api.functions.image.remove);
	const copyFromImage = useMutation(api.functions.place.copyFromImage);

	const [editingImage, setEditingImage] = useState<ImageWithUrl | undefined>();
	const [deletingImage, setDeletingImage] = useState<
		ImageWithUrl | undefined
	>();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	const handleEdit = (image: ImageWithUrl) => {
		setEditingImage(image);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingImage(undefined);
	};

	const handleDelete = async () => {
		if (deletingImage) {
			await removeImage({ id: deletingImage._id });
			setDeletingImage(undefined);
		}
	};

	const handleSetAsIcon = async (image: ImageWithUrl) => {
		await copyFromImage({
			placeId,
			imageId: image._id,
			copyIconImage: true,
			copyLocation: false,
		});
	};

	const handleCopyLocation = async (image: ImageWithUrl) => {
		await copyFromImage({
			placeId,
			imageId: image._id,
			copyIconImage: false,
			copyLocation: true,
		});
	};

	const formatDateTime = (timestamp?: number) => {
		if (!timestamp) return "—";
		return new Date(timestamp).toLocaleString();
	};

	const formatCoordinate = (value?: number, type?: "lat" | "lng") => {
		if (value === undefined) return "—";
		const direction =
			type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
		return `${Math.abs(value).toFixed(4)}° ${direction}`;
	};

	if (!images) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold">Images</h2>
				<Button onClick={() => setIsUploadDialogOpen(true)} size="sm">
					<ImagePlus className="size-4 mr-1" />
					Upload Image
				</Button>
			</div>

			{images.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					<p>No images yet. Upload images from the places table.</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[80px]">Thumbnail</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Capture Date</TableHead>
							<TableHead>Location</TableHead>
							<TableHead className="w-[180px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{images.map((image) => (
							<TableRow key={image._id}>
								<TableCell>
									{image.iconImage ? (
										<img
											src={image.iconImage}
											alt="Thumbnail"
											className="h-12 w-12 rounded object-cover"
										/>
									) : image.url ? (
										<img
											src={image.url}
											alt="Image"
											className="h-12 w-12 rounded object-cover"
										/>
									) : (
										<div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
											<ImageIcon className="size-6 text-muted-foreground" />
										</div>
									)}
								</TableCell>
								<TableCell className="max-w-[200px] truncate">
									{image.description || (
										<span className="text-muted-foreground">
											No description
										</span>
									)}
								</TableCell>
								<TableCell>{formatDateTime(image.dateTime)}</TableCell>
								<TableCell>
									{image.lat !== undefined && image.lng !== undefined ? (
										<span className="text-sm">
											{formatCoordinate(image.lat, "lat")},{" "}
											{formatCoordinate(image.lng, "lng")}
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
											onClick={() => handleEdit(image)}
											title="Edit image"
										>
											<Edit className="size-4" />
										</Button>
										{image.iconImage && (
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleSetAsIcon(image)}
												title="Set as place icon"
											>
												<ImageIcon className="size-4" />
											</Button>
										)}
										{image.lat !== undefined && image.lng !== undefined && (
											<Button
												variant="ghost"
												size="icon-sm"
												onClick={() => handleCopyLocation(image)}
												title="Copy location to place"
											>
												<MapPin className="size-4" />
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeletingImage(image)}
											title="Delete image"
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

			{/* Edit Dialog */}
			<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Image</DialogTitle>
						<DialogDescription>
							Update the image details below.
						</DialogDescription>
					</DialogHeader>
					{editingImage && (
						<ImageEditForm
							image={editingImage}
							onSuccess={handleFormSuccess}
							onCancel={() => setIsFormOpen(false)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={!!deletingImage}
				onOpenChange={(open) => !open && setDeletingImage(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Delete Image</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this image? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeletingImage(undefined)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Image Upload Dialog */}
			<Dialog
				open={isUploadDialogOpen}
				onOpenChange={setIsUploadDialogOpen}
			>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Upload Image</DialogTitle>
						<DialogDescription>
							Upload an image for this place. EXIF metadata (location and
							capture time) will be extracted automatically.
						</DialogDescription>
					</DialogHeader>
					<PlaceImageUploadForm
						placeId={placeId}
						onSuccess={() => setIsUploadDialogOpen(false)}
						onCancel={() => setIsUploadDialogOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
