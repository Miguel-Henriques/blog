import {
	type PreviousRole,
	ProjectsSuggest,
	ROLE_DIAGNOSTIC,
	RoleCodeActions,
} from '@/components/code-widgets'
import { getCertificationTitle } from '@/components/credly-badge'
import { ExperiencePreview, TalkPreview } from '@/components/document-previews'
import { apps } from '@/content/apps'
import { profile } from '@/content/profile'
import {
	type Block,
	blank,
	type CodeFile,
	heading,
	type LineHint,
	line,
	list,
	type MarkdownFile,
	symbolLine,
	type WorkspaceFile,
} from '@/workspace/blocks'

const slugify = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

/* ---------- experience.md ---------- */

const experienceBlocks: Block[] = [
	heading(1, 'Experience'),
	blank(),
	line(profile.summary),
	blank(),
]

for (const position of profile.experience) {
	experienceBlocks.push(
		heading(2, position.role, `## ${position.role} · ${position.company}`),
		line(`\`${position.startDate}\` · ${position.location}`),
	)

	if (position.highlights?.length) {
		experienceBlocks.push(blank(), list(position.highlights))
	}

	for (const project of position.projects ?? []) {
		experienceBlocks.push(
			blank(),
			heading(3, project.name),
			list(project.highlights),
		)

		for (const link of project.links ?? []) {
			experienceBlocks.push(line(`[${link.label}](${link.url})`))
		}
	}

	experienceBlocks.push(blank())
}

experienceBlocks.push(
	heading(2, 'Education'),
	line(profile.education.degree),
	line(`${profile.education.institution} · \`${profile.education.period}\``),
	blank(),
	heading(2, 'Certifications'),
	list(
		profile.certifications.map(
			(certification) =>
				`[${getCertificationTitle(certification.name)}](https://www.credly.com/badges/${certification.badgeId}/public_url)`,
		),
	),
	blank(),
	heading(2, 'Languages'),
	list(profile.languages),
)

const experience: MarkdownFile = {
	kind: 'markdown',
	path: 'experience.md',
	title: 'experience.md',
	detail: 'Roles, projects, education and certifications',
	keywords:
		'experience work career jobs cv aws contextual deloitte bmw education certifications languages',
	blocks: experienceBlocks,
	Preview: () => (
		<ExperiencePreview lineOf={(name) => symbolLine(experience, name)} />
	),
}

/* ---------- talks/*.md ---------- */

const talks: MarkdownFile[] = [...profile.speaking].reverse().map((talk) => {
	const photos = talk.images.filter(
		(image) => !('isLogo' in image && image.isLogo),
	)
	const blocks: Block[] = [
		heading(1, talk.title),
		line(`\`${talk.event}\` · ${talk.location} · ${talk.year}`),
		blank(),
		line(talk.summary),
	]

	if (talk.presentedWith) {
		blocks.push(blank(), line(`Presented with ${talk.presentedWith}.`))
	}

	if (photos.length > 0) {
		blocks.push(blank(), {
			source: photos.map((photo) => `![${photo.alt}](${photo.src})`),
		})
	}

	const path = `talks/${slugify(`${talk.event} ${talk.location} ${talk.year}`)}.md`

	return {
		kind: 'markdown',
		path,
		title: talk.title,
		detail: `${talk.event} · ${talk.location} ${talk.year}`,
		keywords: 'talk talks speaking conference presentation',
		blocks,
		Preview: () => (
			<TalkPreview
				others={talks.filter((other) => other.path !== path)}
				talk={talk}
			/>
		),
	}
})

/* ---------- miguel.ts (home) ---------- */

/** Roles from experience.md, newest first, for the role code actions. */
const getPreviousRoles = (): PreviousRole[] =>
	profile.experience.map((position) => ({
		company: position.company.split(' · ')[0] ?? position.company,
		line: symbolLine(experience, position.role, 2),
		role: position.role,
	}))

const ROLE_SOURCE = '  role: '
const PROJECTS_SOURCE = '  projects: ['

const code = (...source: string[]): Block => ({ source })

/** One line of code with an inlay hint. */
const hinted = (source: string, hint: LineHint): Block => ({
	hints: [hint],
	source: [source],
})

/** Keyboard hint shown while the cursor is on a link's line. */
const follow = (what: string): LineHint => ({ active: `↵ ${what}` })

const home: CodeFile = {
	kind: 'code',
	language: 'TypeScript',
	path: 'miguel.ts',
	title: 'miguel.ts',
	detail: 'Home: who I am, how to reach me, what I’m building',
	keywords: 'home about contact email linkedin github projects reckonx role',
	blocks: [
		{
			source: [
				'/**',
				` * ${profile.name} · ${profile.role} · ${profile.location}`,
				' *',
				...profile.summary
					.split(/(?<=\.) /)
					.map((sentence) => ` * ${sentence}`),
				' */',
			],
		},
		hinted(
			"import experience from './experience.md'",
			follow('open experience.md'),
		),
		hinted("import talks from './talks'", follow('search talks')),
		blank(),
		code('export const miguel = {'),
		hinted(`  email: '${profile.email}',`, follow('write an email')),
		hinted(`  linkedin: '${profile.linkedin}',`, follow('open LinkedIn')),
		hinted(`  github: '${profile.github}',`, follow('open GitHub')),
		hinted("  resume: './resume.pdf',", follow('open resume.pdf')),
		hinted('  experience,', follow('open experience.md')),
		hinted('  talks,', follow('search talks')),
		{
			// The menus explain their own keys once open.
			hints: [{ idle: 'looking for my next role · quick fix' }],
			source: [ROLE_SOURCE],
			diagnostic: { col: ROLE_SOURCE.length + 1, message: ROLE_DIAGNOSTIC },
			widget: () => <RoleCodeActions roles={getPreviousRoles()} />,
		},
		{
			source: [`${PROJECTS_SOURCE}${apps.map((app) => app.name).join(', ')}],`],
			caret: PROJECTS_SOURCE.length + 1,
			hints: [{ idle: `browse ${apps.length} projects` }],
			widget: () => <ProjectsSuggest />,
		},
		code('}'),
	],
}

/* ---------- resume.pdf ---------- */

const resume: WorkspaceFile = {
	kind: 'binary',
	path: 'resume.pdf',
	title: 'resume.pdf',
	detail: 'Download my CV',
	keywords: 'resume cv pdf download',
	language: 'PDF',
}

/* ---------- workspace ---------- */

export const DEFAULT_PATH = home.path

export const files: readonly WorkspaceFile[] = [
	home,
	experience,
	...talks,
	resume,
]

const filesByPath = new Map(files.map((file) => [file.path, file]))

export const getFile = (path: string) => filesByPath.get(path) ?? null

export const folderOf = (path: string) =>
	path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''

export const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1)

export const filesInFolder = (folder: string) =>
	files.filter((file) => folderOf(file.path) === folder)
