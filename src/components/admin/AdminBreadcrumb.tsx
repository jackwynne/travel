import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
	label: string;
	to?: string;
	params?: Record<string, string>;
}

interface AdminBreadcrumbProps {
	items: BreadcrumbItem[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
	return (
		<nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
			<Link
				to="/admin"
				className="flex items-center gap-1 hover:text-foreground transition-colors"
			>
				<Home className="size-4" />
				<span>Admin</span>
			</Link>
			{items.map((item) => (
				<span key={item.label} className="flex items-center gap-1.5">
					<ChevronRight className="size-4" />
					{item.to ? (
						<Link
							to={item.to}
							params={item.params}
							className="hover:text-foreground transition-colors"
						>
							{item.label}
						</Link>
					) : (
						<span className="text-foreground font-medium">{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}
