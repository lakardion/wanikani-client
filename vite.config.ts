import { defineConfig } from 'vite'
import { solidStart } from '@solidjs/start/config'
import { nitro } from 'nitro/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [solidStart({ ssr: false, middleware: 'src/middleware.ts' }), nitro(), tailwindcss()],
})
