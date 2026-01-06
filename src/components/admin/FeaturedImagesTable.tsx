import { useMutation, useQuery } from "convex/react";
import { Edit, ImageIcon, Star, StarOff } from "lucide-react";
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

export function FeaturedImagesTable() {
	const images = useQuery(api.functions.image.getFeatured, {});
	const updateImage = useMutation(api.functions.image.update);

	const [editingImage, setEditingImage] = useState<ImageWithUrl | undefined>();
	const [removingImage, setRemovingImage] = useState<
		ImageWithUrl | undefined
	>();
	const [isFormOpen, setIsFormOpen] = useState(false);

	const handleEdit = (image: ImageWithUrl) => {
		setEditingImage(image);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setEditingImage(undefined);
	};

	const handleRemoveFromFeatured = async () => {
		if (removingImage) {
			await updateImage({
				image: {
					_id: removingImage._id,
					_creationTime: removingImage._creationTime,
					bucket: removingImage.bucket,
					key: removingImage.key,
					featured: false,
					description: removingImage.description,
					lat: removingImage.lat,
					lng: removingImage.lng,
					dateTime: removingImage.dateTime,
					iconImage: removingImage.iconImage,
					location: removingImage.location,
				},
			});
			setRemovingImage(undefined);
		}
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
				<div className="flex items-center gap-2">
					<Star className="size-5 text-yellow-500" />
					<h2 className="text-lg font-semibold">Featured Images</h2>
				</div>
				<p className="text-sm text-muted-foreground">
					{images.length} featured image{images.length !== 1 ? "s" : ""}
				</p>
			</div>

			{images.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground border rounded-lg">
					<Star className="size-12 mx-auto mb-4 opacity-20" />
					<p>No featured images yet.</p>
					<p className="text-sm mt-1">
						Mark images as featured from the places image editor.
					</p>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[80px]">Thumbnail</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Capture Date</TableHead>
							<TableHead>Location</TableHead>
							<TableHead className="w-[120px]">Actions</TableHead>
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
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => setRemovingImage(image)}
											title="Remove from featured"
										>
											<StarOff className="size-4" />
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
						<DialogTitle>Edit Featured Image</DialogTitle>
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

			{/* Remove from Featured Confirmation Dialog */}
			<Dialog
				open={!!removingImage}
				onOpenChange={(open) => !open && setRemovingImage(undefined)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Remove from Featured</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove this image from featured? The
							image will no longer appear on the homepage.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRemovingImage(undefined)}
						>
							Cancel
						</Button>
						<Button variant="default" onClick={handleRemoveFromFeatured}>
							Remove from Featured
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

