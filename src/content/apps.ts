export interface AppMedia {
	alt: string
	height: number
	imageSources?: {
		avif?: string
		webp: string
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

export const apps: readonly AppEntry[] = []
