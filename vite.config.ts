import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enableInspector = mode === 'development' && env.VITE_ENABLE_INSPECTOR !== 'false'

  if (mode === 'production' && env.VITE_ENABLE_DEMO_AUTH === 'true') {
    throw new Error('VITE_ENABLE_DEMO_AUTH cannot be true in a production build.')
  }

  return {
    base: '/',
    plugins: [enableInspector && inspectAttr(), react()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
      coverage: {
        reporter: ['text', 'html'],
      },
    },
  }
});
