import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectDirectory = resolve(import.meta.dirname, '..')
const outputDirectory = resolve(projectDirectory, 'dist')
const siteUrl = process.env.SITE_URL?.replace(/\/$/, '')

if (siteUrl) {
	await Promise.all([
		writeFile(
			resolve(outputDirectory, 'sitemap.xml'),
			[
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
				`\t<url><loc>${siteUrl}/</loc></url>`,
				'</urlset>',
				'',
			].join('\n'),
		),
		writeFile(
			resolve(outputDirectory, 'robots.txt'),
			`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
		),
	])
}
