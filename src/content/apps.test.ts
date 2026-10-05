import { describe, expect, it } from 'vitest'
import { apps } from '@/content/apps'

describe('apps catalog', () => {
	it('contains unique app names and valid links', () => {
		const names = apps.map((app) => app.name)

		expect(new Set(names).size).toBe(names.length)

		for (const app of apps) {
			const { liveUrl, githubUrl } = app
			expect(['in-development', 'generally-available']).toContain(app.status)
			expect(Array.isArray(app.labels)).toBe(true)
			if (app.openSource) expect(githubUrl).toBeTruthy()

			if (liveUrl) {
				expect(() => new URL(liveUrl)).not.toThrow()
			}

			if (githubUrl) {
				expect(() => new URL(githubUrl)).not.toThrow()
			}
		}
	})

	it('requires complete media dimensions and sources', () => {
		for (const app of apps) {
			if (!app.media) {
				continue
			}

			expect(app.media.width).toBeGreaterThan(0)
			expect(app.media.height).toBeGreaterThan(0)

			if (app.media.type === 'image') {
				expect(app.media.imageSources?.avif).toBeTruthy()
			} else {
				expect(app.media.videoSources?.mp4).toBeTruthy()
			}
		}
	})
})
