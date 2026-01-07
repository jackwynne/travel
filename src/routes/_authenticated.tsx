import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { ConvexProviderWithAuth } from "convex/react";
import { useConvexAuthFromWorkOS } from "@/lib/convex-workos-auth";
import { getAuth, getSignInUrl } from '@workos/authkit-tanstack-react-start';

export const Route = createFileRoute('/_authenticated')({
  loader: async ({ location }) => {
    const { user } = await getAuth();
    if (!user) {
      const path = location.pathname;
      const href = await getSignInUrl({ data: { returnPathname: path } });
      throw redirect({ href });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { convexQueryClient } = Route.useRouteContext();
  return (
    <ConvexProviderWithAuth
      client={convexQueryClient.convexClient}
      useAuth={useConvexAuthFromWorkOS}
    >
      <Outlet />
    </ConvexProviderWithAuth>
  );
}
