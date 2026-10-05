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

interface AppDetails {
	description: string
	liveUrl?: string
	media?: AppMedia
	name: string
	previewUrl?: string
	status: 'in-development' | 'generally-available'
	labels: readonly string[]
}

export type AppEntry = AppDetails &
	(
		| { openSource: true; githubUrl: string }
		| { openSource?: false; githubUrl?: string }
	)

export const apps: readonly AppEntry[] = appsData as readonly AppEntry[]
