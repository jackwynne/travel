import { createFileRoute, Outlet, Link, useMatches } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

// Type for admin page metadata that routes can provide via context
export interface AdminPageContext {
	title: string;
	breadcrumbs: Array<{
		label: string;
		to?: string;
		params?: Record<string, string>;
	}>;
}

export const Route = createFileRoute("/_authenticated/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	const matches = useMatches();
	
	// Find the deepest match that has adminPage context
	let pageContext: AdminPageContext | null = null;
	for (let i = matches.length - 1; i >= 0; i--) {
		const match = matches[i];
		if (match.context && 'adminPage' in match.context) {
			pageContext = match.context.adminPage as AdminPageContext;
			break;
		}
	}

	// Default values if no context is found
	const title = pageContext?.title ?? "Admin";
	const breadcrumbs = pageContext?.breadcrumbs ?? [];

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "18rem",
				} as React.CSSProperties
			}
		>
			<AdminSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink render={<Link to="/admin" />}>
									Admin
								</BreadcrumbLink>
							</BreadcrumbItem>
							{breadcrumbs.map((crumb) => (
								<span key={crumb.label} className="contents">
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										{crumb.to ? (
											<BreadcrumbLink render={<Link to={crumb.to} params={crumb.params} />}>
												{crumb.label}
											</BreadcrumbLink>
										) : (
											<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
										)}
									</BreadcrumbItem>
								</span>
							))}
						</BreadcrumbList>
					</Breadcrumb>
					<div className="ml-auto">
						<h1 className="text-lg font-semibold">{title}</h1>
					</div>
				</header>
				<main className="flex-1 p-6">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
