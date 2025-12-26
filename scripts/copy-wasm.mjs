import { mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = path.resolve(__dirname, '../node_modules/mediainfo.js/dist/MediaInfoModule.wasm')
const dest = path.resolve(__dirname, '../public/MediaInfoModule.wasm')

try {
  await mkdir(path.dirname(dest), { recursive: true })
  await copyFile(src, dest)
} catch (err) {
  console.error('Failed to copy MediaInfoModule.wasm:', err)
  process.exit(1)
}
