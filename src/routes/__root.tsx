import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getAuth } from '@workos/authkit-tanstack-react-start';
import { AuthKitProvider } from '@workos/authkit-tanstack-react-start/client';
import { ConvexProvider } from 'convex/react';
import interCssUrl from '@fontsource-variable/inter/index.css?url';
import appCssUrl from '../app.css?url';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { ConvexReactClient } from 'convex/react';
import type { ConvexQueryClient } from '@convex-dev/react-query';
import { ThemeProvider } from '../hooks/theme-provider';
import type { ReactElement } from 'react';

const fetchWorkosAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await getAuth();
  const { user } = auth;

  return {
    userId: user?.id ?? null,
    token: user ? auth.accessToken : null,
  };
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Jack Travel',
      },
    ],
    links: [
      { rel: 'stylesheet', href: interCssUrl },
      { rel: 'stylesheet', href: appCssUrl },
      { rel: 'icon', href: '/plane.svg' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <div>Not Found</div>,
  beforeLoad: async (ctx) => {
    const { userId, token } = await fetchWorkosAuth();

    // During SSR only (the only time serverHttpClient exists),
    // set the Clerk auth token to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { userId, token };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <AppProviders>
        <Outlet />
      </AppProviders>
    </RootDocument>
  );
}

function AppProviders({ children }: Readonly<{ children: ReactNode }>): ReactElement {
  const { convexQueryClient } = Route.useRouteContext();

  return (
    <AuthKitProvider>
      <ConvexProvider client={convexQueryClient.convexClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </ConvexProvider>
    </AuthKitProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
