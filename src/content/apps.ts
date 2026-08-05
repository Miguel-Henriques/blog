import appsData from '@content/apps.json'

export interface AppMedia {
	alt: string
	height: number
	imageSources?: {
		avif: string
	}
	poster?: string
	type: 'image' | 'video'
	videoSources?: {
		mp4: string
		webm?: string
	}
	width: number
}

export interface AppEntry {
	description: string
	liveUrl?: string
	media?: AppMedia
	name: string
	sourceUrl?: string
	status: 'active' | 'archived' | 'in-progress'
	technologies: readonly string[]
}

export const apps = appsData as readonly AppEntry[]
