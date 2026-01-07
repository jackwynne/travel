import { useAccessToken, useAuth } from "@workos/authkit-tanstack-react-start/client";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useConvexAuthFromWorkOS() {
  const { loading, user } = useAuth();
  const { accessToken, getAccessToken } = useAccessToken();
  const tokenCallCountRef = useRef(0);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "src/lib/convex-workos-auth.ts:useConvexAuthFromWorkOS",
        message: "workos auth state",
        data: { loading, hasUser: !!user, hasAccessToken: !!accessToken },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
  }, [loading, user, accessToken]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      tokenCallCountRef.current += 1;
      // #region agent log
      if (tokenCallCountRef.current <= 5) {
        fetch("http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "src/lib/convex-workos-auth.ts:fetchAccessToken",
            message: "fetchAccessToken called",
            data: {
              call: tokenCallCountRef.current,
              forceRefreshToken,
              hasAccessToken: !!accessToken,
              loading,
              hasUser: !!user,
            },
            timestamp: Date.now(),
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "E",
          }),
        }).catch(() => {});
      }
      // #endregion

      if (!accessToken || forceRefreshToken) {
        const t = (await getAccessToken()) ?? null;
        // #region agent log
        if (tokenCallCountRef.current <= 5) {
          fetch("http://127.0.0.1:7242/ingest/107455fa-5157-421b-bcde-caa8b66e9990", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "src/lib/convex-workos-auth.ts:fetchAccessToken",
              message: "fetchAccessToken result",
              data: { call: tokenCallCountRef.current, returned: !!t },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "pre-fix",
              hypothesisId: "E",
            }),
          }).catch(() => {});
        }
        // #endregion
        return t;
      }

      return accessToken;
    },
    [accessToken, getAccessToken, loading, user],
  );

  return useMemo(
    () => ({
      isLoading: loading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [loading, user, fetchAccessToken],
  );
}


