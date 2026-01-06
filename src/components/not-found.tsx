import { Link } from "@tanstack/react-router";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
			<div className="text-center">
				<h1 className="text-8xl font-bold text-primary">404</h1>
				<div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
				<h2 className="mt-6 text-2xl font-semibold text-foreground">
					Page not found
				</h2>
				<p className="mt-3 text-muted-foreground max-w-md">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<Link
					to="/"
					className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="m12 19-7-7 7-7" />
						<path d="M19 12H5" />
					</svg>
					Back to home
				</Link>
			</div>
		</div>
	);
}
