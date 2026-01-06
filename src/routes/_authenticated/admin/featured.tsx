import { createFileRoute } from "@tanstack/react-router";
import type { AdminPageContext } from "../admin";
import { FeaturedImagesTable } from "@/components/admin";

export const Route = createFileRoute("/_authenticated/admin/featured")({
	beforeLoad: () => {
		return {
			adminPage: {
				title: "Featured Images",
				breadcrumbs: [{ label: "Featured Images" }],
			} satisfies AdminPageContext,
		};
	},
	component: FeaturedImagesPage,
});

function FeaturedImagesPage() {
	return (
		<div className="space-y-6">
			<p className="text-muted-foreground">
				Manage images displayed on the homepage. Featured images are shown to
				visitors as highlights from your travel experiences.
			</p>
			<FeaturedImagesTable />
		</div>
	);
}

