import { createRouter } from '@tanstack/react-router';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { QueryClient } from '@tanstack/react-query';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { ConvexReactClient } from 'convex/react';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    throw new Error('missing VITE_CONVEX_URL env var');
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/router.tsx:getRouter',message:'getRouter init',data:(() => { try { const u = new URL(CONVEX_URL); return { isBrowser: typeof window !== 'undefined', convexProtocol: u.protocol, convexHost: u.host, pageProtocol: typeof window !== 'undefined' ? window.location.protocol : null }; } catch { return { isBrowser: typeof window !== 'undefined', convexUrlParseError: true, pageProtocol: typeof window !== 'undefined' ? window.location.protocol : null }; } })(),timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const convex = new ConvexReactClient(CONVEX_URL);
  const convexQueryClient = new ConvexQueryClient(convex);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  });
  convexQueryClient.connect(queryClient);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/router.tsx:getRouter',message:'convexQueryClient connected',data:{isBrowser:typeof window!=='undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultPreloadStaleTime: 0, // Let React Query handle all caching
    defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
    defaultNotFoundComponent: () => <p>not found</p>,
    context: { queryClient, convexClient: convex, convexQueryClient },
    Wrap: ({ children }) => children,
  });
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}
