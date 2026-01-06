import { defineConfig, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// Plugin to stub heavy 3D libraries during SSR to reduce bundle size
function clientOnlyModulesPlugin(): Plugin {
  const clientOnlyPackages = [
    'three',
    'three-globe',
    '@react-three/fiber',
    '@react-three/drei',
  ]

  return {
    name: 'client-only-modules',
    enforce: 'pre',
    resolveId(id, _importer, options) {
      // Only apply during SSR builds
      if (!options?.ssr) return null

      // Check if this is a client-only package
      const isClientOnly = clientOnlyPackages.some(
        (pkg) => id === pkg || id.startsWith(`${pkg}/`)
      )

      if (isClientOnly) {
        // Return a virtual module ID
        return `\0virtual:client-only-stub:${id}`
      }

      return null
    },
    load(id) {
      // Handle virtual module requests
      if (id.startsWith('\0virtual:client-only-stub:')) {
        // Return an empty module that exports common patterns
        return `
          export default {};
          export const Canvas = () => null;
          export const OrbitControls = () => null;
          export const extend = () => {};
          export const useThree = () => ({});
          export const useFrame = () => {};
          export const Color = class {};
        `
      }
      return null
    },
  }
}

// Plugin to fix React 19 compatibility with use-sync-external-store
function useSyncExternalStoreShimPlugin(): Plugin {
  return {
    name: 'use-sync-external-store-shim',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'use-sync-external-store/shim' || 
          id === 'use-sync-external-store/shim/index.js' ||
          id === 'use-sync-external-store/shim/index') {
        return '\0virtual:use-sync-external-store-shim'
      }
      if (id === 'use-sync-external-store/shim/with-selector.js' ||
          id === 'use-sync-external-store/shim/with-selector') {
        return '\0virtual:use-sync-external-store-with-selector'
      }
      return null
    },
    load(id) {
      if (id === '\0virtual:use-sync-external-store-shim') {
        return `export { useSyncExternalStore } from 'react';`
      }
      if (id === '\0virtual:use-sync-external-store-with-selector') {
        return `
          import { useSyncExternalStore, useRef, useCallback, useMemo } from 'react';
          
          export function useSyncExternalStoreWithSelector(
            subscribe,
            getSnapshot,
            getServerSnapshot,
            selector,
            isEqual
          ) {
            const instRef = useRef(null);
            
            const inst = instRef.current;
            let memoizedSelector;
            let memoizedSnapshot;
            let memoizedSelection;
            
            if (inst === null) {
              const inst = { hasValue: false, value: null };
              instRef.current = inst;
            }
            
            const [getSelection, getServerSelection] = useMemo(() => {
              let hasMemo = false;
              let memoizedSnapshot;
              let memoizedSelection;
              
              const memoizedSelector = (nextSnapshot) => {
                if (!hasMemo) {
                  hasMemo = true;
                  memoizedSnapshot = nextSnapshot;
                  const nextSelection = selector(nextSnapshot);
                  if (isEqual !== undefined && instRef.current?.hasValue) {
                    const currentSelection = instRef.current.value;
                    if (isEqual(currentSelection, nextSelection)) {
                      memoizedSelection = currentSelection;
                      return currentSelection;
                    }
                  }
                  memoizedSelection = nextSelection;
                  return nextSelection;
                }
                
                const prevSnapshot = memoizedSnapshot;
                const prevSelection = memoizedSelection;
                
                if (Object.is(prevSnapshot, nextSnapshot)) {
                  return prevSelection;
                }
                
                const nextSelection = selector(nextSnapshot);
                
                if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
                  return prevSelection;
                }
                
                memoizedSnapshot = nextSnapshot;
                memoizedSelection = nextSelection;
                return nextSelection;
              };
              
              const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
              const getServerSnapshotWithSelector = getServerSnapshot === undefined 
                ? undefined 
                : () => memoizedSelector(getServerSnapshot());
                
              return [getSnapshotWithSelector, getServerSnapshotWithSelector];
            }, [getSnapshot, getServerSnapshot, selector, isEqual]);
            
            const value = useSyncExternalStore(subscribe, getSelection, getServerSelection);
            
            useRef().current = { hasValue: true, value };
            
            return value;
          }
        `;
      }
      return null
    },
  }
}

const config = defineConfig({
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ["@jsquash/avif", "@jsquash/jpeg", "@jsquash/png", "@jsquash/resize"]
  },
  plugins: [
    // React 19 shim MUST be first
    useSyncExternalStoreShimPlugin(),
    // Client-only modules plugin to intercept imports
    clientOnlyModulesPlugin(),
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
})

export default config
