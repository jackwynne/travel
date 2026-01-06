import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
	validateSearch: (search: Record<string, unknown>) => ({
		redirect: (search.redirect as string) || "/",
	}),
	component: SignInPage,
});

function SignInPage() {
	const { redirect } = Route.useSearch();

	return (
		<div className="flex min-h-screen items-center justify-center">
			<SignIn
				fallbackRedirectUrl={redirect}
				signUpFallbackRedirectUrl={redirect}
			/>
		</div>
	);
}
