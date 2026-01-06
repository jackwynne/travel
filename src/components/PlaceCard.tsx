import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type Category,
	getCategoryLabel,
} from "@/lib/category-utils";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

// Category color mapping for fallback gradients
const categoryGradients: Record<Category, string> = {
	"gallery+museum": "from-purple-500/80 to-indigo-600/80",
	park: "from-green-500/80 to-emerald-600/80",
	restaurant: "from-orange-500/80 to-red-500/80",
	"cafe+bakery+snacks": "from-amber-400/80 to-orange-500/80",
	"bar+pub+club": "from-pink-500/80 to-purple-600/80",
	rooftop_bar: "from-sky-400/80 to-blue-600/80",
	hotel: "from-slate-500/80 to-slate-700/80",
	"theatre+concert_hall+venue": "from-red-500/80 to-rose-600/80",
	"landmark+church+view": "from-teal-500/80 to-cyan-600/80",
	other: "from-gray-500/80 to-gray-600/80",
};

export type PlaceCardData = {
	_id: Id<"place">;
	name: string;
	category: Category;
	rating?: number;
	description?: string;
	iconImage?: string;
	cityId: Id<"city">;
	cityName: string;
	countryId: Id<"country"> | null;
	countryName?: string;
};

type PlaceCardProps = {
	place: PlaceCardData;
	className?: string;
};

export function PlaceCard({ place, className }: PlaceCardProps) {
	const gradient = categoryGradients[place.category] ?? categoryGradients.other;

	if (!place.countryId) {
		return null;
	}

	return (
		<Link
			to="/country/$countryId/city/$cityId"
			params={{
				countryId: place.countryId,
				cityId: place.cityId,
			}}
			className="block group"
		>
			<Card
				size="sm"
				className={cn(
					"h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden",
					className,
				)}
			>
				{/* Image Section */}
				<div className="relative h-32 w-full overflow-hidden">
					{place.iconImage ? (
						<img
							src={place.iconImage}
							alt={place.name}
							className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					) : (
						<div
							className={cn(
								"h-full w-full bg-gradient-to-br flex items-center justify-center",
								gradient,
							)}
						>
							<MapPin className="h-8 w-8 text-white/70" />
						</div>
					)}
					{/* Category Badge Overlay */}
					<div className="absolute top-2 left-2">
						<Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
							{getCategoryLabel(place.category)}
						</Badge>
					</div>
					{/* Rating Badge */}
					{place.rating !== undefined && place.rating > 0 && (
						<div className="absolute top-2 right-2">
							<Badge variant="default" className="bg-amber-500 text-white gap-0.5">
								<Star className="h-3 w-3 fill-current" />
								{place.rating.toFixed(1)}
							</Badge>
						</div>
					)}
				</div>

				<CardHeader className="pb-1">
					<CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
						{place.name}
					</CardTitle>
				</CardHeader>

				<CardContent className="pt-0">
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<MapPin className="h-3 w-3" />
						<span className="line-clamp-1">{place.cityName}</span>
						{place.countryName && (
							<>
								<span>·</span>
								<span className="line-clamp-1">{place.countryName}</span>
							</>
						)}
					</div>
					{place.description && (
						<p className="mt-2 text-xs text-muted-foreground line-clamp-2">
							{place.description}
						</p>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}

// Skeleton loader for PlaceCard
export function PlaceCardSkeleton({ className }: { className?: string }) {
	return (
		<Card size="sm" className={cn("h-full overflow-hidden", className)}>
			<div className="h-32 w-full bg-muted animate-pulse" />
			<CardHeader className="pb-1">
				<div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
			</CardHeader>
			<CardContent className="pt-0">
				<div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
			</CardContent>
		</Card>
	);
}

