import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Palette, MapPin, Building2, Image } from "lucide-react";

import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
	component: AdminDashboard,
});

const navigationItems = [
	{
		title: "Countries",
		description: "Manage countries, cities, places, and images. Start here to navigate through the content hierarchy.",
		icon: Globe,
		to: "/admin/countries" as const,
		gradient: "from-blue-500/20 to-cyan-500/20",
		iconColor: "text-blue-500",
		subItems: [
			{ icon: Building2, label: "Cities" },
			{ icon: MapPin, label: "Places" },
			{ icon: Image, label: "Images" },
		],
	},
	{
		title: "Colours",
		description: "View and explore the design system colour palette with light and dark mode support.",
		icon: Palette,
		to: "/admin/colours" as const,
		gradient: "from-purple-500/20 to-pink-500/20",
		iconColor: "text-purple-500",
	},
];

function AdminDashboard() {
	return (
		<div>
			<AdminBreadcrumb items={[{ label: "Dashboard" }]} />

			<div className="space-y-8">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Admin Dashboard
					</h1>
					<p className="text-muted-foreground mt-2">
						Manage your travel content and system settings
					</p>
				</div>

				{/* Navigation Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{navigationItems.map((item) => (
						<Link
							key={item.title}
							to={item.to}
							className="block group"
						>
							<Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div
											className={`p-3 rounded-xl bg-gradient-to-br ${item.gradient}`}
										>
											<item.icon className={`size-6 ${item.iconColor}`} />
										</div>
										<svg
											className="size-5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
									<CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
										{item.title}
									</CardTitle>
									<CardDescription className="text-sm">
										{item.description}
									</CardDescription>
								</CardHeader>
								{item.subItems && (
									<CardContent className="pt-0">
										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											{item.subItems.map((subItem) => (
												<div
													key={subItem.label}
													className="flex items-center gap-1.5"
												>
													<subItem.icon className="size-3.5" />
													<span>{subItem.label}</span>
												</div>
											))}
										</div>
									</CardContent>
								)}
							</Card>
						</Link>
					))}
				</div>

				{/* Quick Info */}
				<div className="rounded-xl border border-border/50 bg-muted/30 p-6">
					<h2 className="text-sm font-semibold text-foreground mb-3">
						Content Hierarchy
					</h2>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Globe className="size-4" />
						<span>Countries</span>
						<span className="text-muted-foreground/50">→</span>
						<Building2 className="size-4" />
						<span>Cities</span>
						<span className="text-muted-foreground/50">→</span>
						<MapPin className="size-4" />
						<span>Places</span>
						<span className="text-muted-foreground/50">→</span>
						<Image className="size-4" />
						<span>Images</span>
					</div>
					<p className="text-xs text-muted-foreground mt-3">
						Navigate through countries to access cities, places, and their associated images.
					</p>
				</div>
			</div>
		</div>
	);
}
