import type { Infer } from "convex/values";
import type schema from "../../convex/schema";

type Category = Infer<typeof schema.tables.place.validator.fields.category>;

const categoryLabels: Record<Category, string> = {
	"gallery+museum": "Gallery & Museum",
	park: "Park",
	restaurant: "Restaurant",
	"cafe+bakery+snacks": "Cafe, Bakery & Snacks",
	"bar+pub+club": "Bar, Pub & Club",
	rooftop_bar: "Rooftop Bar",
	hotel: "Hotel",
	"theatre+concert_hall+venue": "Theatre, Concert Hall & Venue",
	"landmark+church+view": "Landmark, Church & View",
	other: "Other",
};

export function getCategoryLabel(category: Category): string {
	return categoryLabels[category] ?? category;
}

export function getAllCategories(): { value: Category; label: string }[] {
	return (Object.entries(categoryLabels) as [Category, string][]).map(
		([value, label]) => ({
			value,
			label,
		}),
	);
}

export type { Category };
