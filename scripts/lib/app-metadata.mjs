import { JSDOM } from 'jsdom'

export function readAppMetadata(html, pageUrl) {
	const dom = new JSDOM(html)
	const { document } = dom.window
	const image = document.querySelector('meta[property="og:image"]')?.content
	const description =
		document.querySelector('meta[property="og:description"]')?.content ||
		document.querySelector('meta[name="description"]')?.content
	let previewUrl
	try {
		if (image) {
			const resolved = new URL(image, pageUrl)
			if (resolved.protocol === 'https:') previewUrl = resolved.href
		}
	} catch {
		// Missing or malformed preview metadata leaves the card without media.
	}
	dom.window.close()
	return { description, previewUrl }
}
