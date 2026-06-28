import { copyFile, mkdir } from 'node:fs/promises'

const wasmSourceUrl = new URL('../node_modules/mediainfo.js/dist/MediaInfoModule.wasm', import.meta.url)
const wasmDestinationUrl = new URL('../public/MediaInfoModule.wasm', import.meta.url)

try {
  await mkdir(new URL('.', wasmDestinationUrl), { recursive: true })
  await copyFile(wasmSourceUrl, wasmDestinationUrl)
} catch (copyError) {
  console.error('Failed to copy MediaInfoModule.wasm:', copyError)
  process.exit(1)
}
