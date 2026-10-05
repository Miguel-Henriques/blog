import profileData from '@content/profile.json'

export interface SkillGroup {
	label: string
	items: readonly string[]
}

export interface ExperienceLink {
	label: string
	url: string
}

export interface ExperienceMedia {
	alt: string
	caption: string
	src: string
}

export interface ExperienceProject {
	name: string
	highlights: readonly string[]
	links?: readonly ExperienceLink[]
	media?: readonly ExperienceMedia[]
}

export interface ExperienceEntry {
	role: string
	company: string
	logos: readonly string[]
	startDate: string
	location: string
	highlights?: readonly string[]
	projects?: readonly ExperienceProject[]
}

export const profile = profileData as Omit<
	typeof profileData,
	'experience' | 'skills'
> & {
	experience: readonly ExperienceEntry[]
	skills?: readonly SkillGroup[]
}
