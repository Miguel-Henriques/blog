import { readFile, writeFile } from 'node:fs/promises'
import { readAppMetadata } from './lib/app-metadata.mjs'

const catalogUrl = new URL('../content/apps.json', import.meta.url)
const apps = JSON.parse(await readFile(catalogUrl, 'utf8'))
let changed = false

for (const app of apps) {
	if (!app.liveUrl) continue
	try {
		const response = await fetch(app.liveUrl, {
			signal: AbortSignal.timeout(10_000),
		})
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		const metadata = readAppMetadata(await response.text(), response.url)
		if (metadata.previewUrl && metadata.previewUrl !== app.previewUrl) {
			app.previewUrl = metadata.previewUrl
			changed = true
		}
		if (!app.description && metadata.description) {
			app.description = metadata.description
			changed = true
		}
		console.log(
			metadata.previewUrl
				? `${app.name}: found a remote preview image.`
				: `${app.name}: no Open Graph image; keeping the card without new media.`,
		)
	} catch (error) {
		console.warn(`${app.name}: could not refresh metadata (${error.message}).`)
	}
}

if (changed) {
	await writeFile(catalogUrl, `${JSON.stringify(apps, null, '\t')}\n`)
}
