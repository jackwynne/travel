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
import { useEffect, useRef } from 'react';

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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/routes/__root.tsx:beforeLoad',message:'root beforeLoad resolved',data:{hasUserId:!!userId,hasToken:!!token,hasServerHttpClient:!!ctx.context.convexQueryClient.serverHttpClient},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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

function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  const { convexQueryClient } = Route.useRouteContext();
  const connLogCountRef = useRef(0);

  useEffect(() => {
    connLogCountRef.current = 0;
    try {
      // Log initial connection state + subscribe to changes (limit to avoid spam)
      const initial = convexQueryClient.convexClient.connectionState();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/routes/__root.tsx:AppProviders',message:'convex connectionState initial',data:initial,timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const unsub = convexQueryClient.convexClient.subscribeToConnectionState((s) => {
        connLogCountRef.current += 1;
        if (connLogCountRef.current > 15) return;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/routes/__root.tsx:AppProviders',message:'convex connectionState change',data:{...s,seq:connLogCountRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
      });
      return () => unsub();
    } catch (e) {
      const err = e as { name?: string; message?: string };
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/routes/__root.tsx:AppProviders',message:'convex connectionState subscribe error',data:{name:err?.name??null,message:err?.message??String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
    }
  }, [convexQueryClient]);

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
