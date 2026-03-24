import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    pages({
      entry: 'src/index.ts'
    }),
    {
      name: 'copy-routes',
      closeBundle() {
        try {
          copyFileSync(
            resolve(__dirname, 'public/_routes.json'),
            resolve(__dirname, 'dist/_routes.json')
          )
        } catch (e) {}
      }
    }
  ],
  build: {
    outDir: 'dist'
  }
})
