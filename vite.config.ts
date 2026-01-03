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

const config = defineConfig({
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ["@jsquash/avif", "@jsquash/jpeg", "@jsquash/png", "@jsquash/resize"]
  },
  plugins: [
    // Client-only modules plugin MUST be first to intercept imports
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
