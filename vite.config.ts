import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const siteMetadata = (): Plugin => ({
	name: 'site-metadata',
	transformIndexHtml: (html) => {
		const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')

		if (!siteUrl) {
			return html
		}

		return {
			html,
			tags: [
				{
					attrs: {
						href: `${siteUrl}/`,
						rel: 'canonical',
					},
					injectTo: 'head',
					tag: 'link',
				},
				{
					attrs: {
						content: `${siteUrl}/`,
						property: 'og:url',
					},
					injectTo: 'head',
					tag: 'meta',
				},
			],
		}
	},
})

export default defineConfig({
	plugins: [react(), tailwindcss(), siteMetadata()],
	resolve: {
		alias: {
			'@': resolve(import.meta.dirname, 'src'),
		},
	},
	test: {
		environment: 'jsdom',
		environmentOptions: {
			jsdom: {
				url: 'https://portfolio.test',
			},
		},
		setupFiles: ['./src/test/setup.ts'],
	},
})
