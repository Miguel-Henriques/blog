import { describe, expect, it } from 'vitest'
import { readAppMetadata } from './app-metadata.mjs'

describe('app preview metadata', () => {
	it('resolves remote images and decodes metadata without downloading assets', () => {
		const metadata = readAppMetadata(
			'<meta property="og:image" content="/preview.png"><meta property="og:description" content="Routes &amp; planning">',
			'https://reckonx.apps.mipestana.com/',
		)
		expect(metadata).toEqual({
			previewUrl: 'https://reckonx.apps.mipestana.com/preview.png',
			description: 'Routes & planning',
		})
	})

	it('leaves missing media unset', () => {
		expect(
			readAppMetadata('<title>ReckonX</title>', 'https://example.com/'),
		).toEqual({ description: undefined, previewUrl: undefined })
	})

	it('rejects non-HTTPS image URLs', () => {
		expect(
			readAppMetadata(
				'<meta property="og:image" content="javascript:alert(1)">',
				'https://example.com/',
			).previewUrl,
		).toBeUndefined()
	})
})
