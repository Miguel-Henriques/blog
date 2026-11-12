import type { ReactNode } from 'react'
import { FileIcon } from '@/components/code-line'
import { CompanyLogo } from '@/components/company-logo'
import { CredlyBadge, getCertificationTitle } from '@/components/credly-badge'
import { ExperienceDetails } from '@/components/experience-content'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/workspace/workspace'

/*
 * Markdown previews are rendered documents, like an editor's preview pane:
 * proportional type, no gutter, no cursor and no markdown markers. Elements
 * carry the `data-line` of their source so the preview can scroll to them.
 */

export function DocumentShell({ children }: { children: ReactNode }) {
	return (
		<article className="w-full font-ui text-[15px] leading-7 text-foreground">
			{children}
		</article>
	)
}

export function DocTitle({
	children,
	line,
}: {
	children: ReactNode
	line: number
}) {
	return (
		<h1
			className="border-b pb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
			data-line={line}
		>
			{children}
		</h1>
	)
}

export function DocHeading({
	children,
	className,
	line,
}: {
	children: ReactNode
	className?: string
	line: number
}) {
	return (
		<h2
			className={cn(
				'mt-14 scroll-mt-20 border-b pb-2 text-xl font-semibold tracking-tight',
				className,
			)}
			data-line={line}
		>
			{children}
		</h2>
	)
}

const Meta = ({ children }: { children: ReactNode }) => (
	<p className="font-mono text-xs leading-5 text-muted-foreground">
		{children}
	</p>
)

/* ---------- experience.md ---------- */

export function ExperiencePreview({
	lineOf,
}: {
	/** Source line of a heading, by name. */
	lineOf: (name: string) => number
}) {
	return (
		<DocumentShell>
			<DocTitle line={1}>Experience</DocTitle>
			<p className="mt-5 text-muted-foreground">{profile.summary}</p>

			<ol className="mt-12 space-y-14">
				{profile.experience.map((position) => (
					<li
						className="grid scroll-mt-20 gap-x-8 gap-y-3 md:grid-cols-[8.5rem_minmax(0,1fr)]"
						data-line={lineOf(position.role)}
						key={`${position.company}-${position.startDate}`}
					>
						<div className="md:pt-3 md:text-right">
							<Meta>
								{position.startDate}
								<br className="max-md:hidden" />
								<span className="md:hidden"> · </span>
								{position.location}
							</Meta>
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-4">
								<div className="company-logo-group flex shrink-0">
									{position.logos.map((logo) => (
										<CompanyLogo key={logo} logo={logo} />
									))}
								</div>
								<div className="min-w-0">
									<h2 className="text-lg leading-snug font-semibold">
										{position.role}
									</h2>
									<p className="text-sm text-primary">{position.company}</p>
								</div>
							</div>
							<ExperienceDetails className="mt-5" position={position} />
						</div>
					</li>
				))}
			</ol>

			<DocHeading line={lineOf('Education')}>Education</DocHeading>
			<p className="mt-4 font-medium">{profile.education.degree}</p>
			<Meta>
				{profile.education.institution} · {profile.education.period}
			</Meta>

			<DocHeading line={lineOf('Certifications')}>Certifications</DocHeading>
			<ul className="mt-5 grid gap-4 sm:grid-cols-3">
				{profile.certifications.map((certification) => (
					<li
						className="flex flex-col items-center gap-3 rounded-md border bg-card p-4 text-center text-sm"
						key={certification.badgeId}
					>
						<CredlyBadge
							badgeId={certification.badgeId}
							name={certification.name}
						/>
						<span className="leading-snug">
							{getCertificationTitle(certification.name)}
						</span>
					</li>
				))}
			</ul>

			<DocHeading line={lineOf('Languages')}>Languages</DocHeading>
			<ul className="mt-4 space-y-1 text-muted-foreground">
				{profile.languages.map((language) => (
					<li key={language}>{language}</li>
				))}
			</ul>
		</DocumentShell>
	)
}

/* ---------- talks/*.md ---------- */

type Talk = (typeof profile.speaking)[number]

export function TalkPreview({
	others,
	talk,
}: {
	others: readonly { detail: string; path: string; title: string }[]
	talk: Talk
}) {
	const { open } = useWorkspace()
	const photos = talk.images.filter(
		(image) => !('isLogo' in image && image.isLogo),
	)

	return (
		<DocumentShell>
			<Meta>
				{talk.event} · {talk.location} · {talk.year}
			</Meta>
			<DocTitle line={1}>
				<span className="mt-2 block">{talk.title}</span>
			</DocTitle>
			<p className="mt-5 text-muted-foreground">{talk.summary}</p>
			{talk.presentedWith ? (
				<p className="mt-3 text-muted-foreground">
					Presented with{' '}
					<span className="text-foreground">{talk.presentedWith}</span>.
				</p>
			) : null}

			{photos.length > 0 ? (
				<div
					className={cn(
						'mt-8 grid gap-3',
						// A single photo takes three quarters of the width, more take halves.
						photos.length === 1 ? 'sm:w-3/4' : 'sm:grid-cols-2',
					)}
				>
					{photos.map((photo) => (
						<img
							alt={photo.alt}
							className="aspect-[4/3] w-full rounded-md border bg-muted object-cover"
							decoding="async"
							key={photo.src}
							loading="lazy"
							src={photo.src}
						/>
					))}
				</div>
			) : null}

			{others.length > 0 ? (
				<nav aria-label="Other talks" className="mt-14">
					<h2 className="border-b pb-2 text-sm font-semibold text-muted-foreground">
						Other talks
					</h2>
					<ul className="mt-2">
						{others.map((other) => (
							<li key={other.path}>
								<button
									className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-secondary"
									onClick={() => open(other.path)}
									type="button"
								>
									<FileIcon path={other.path} />
									<span className="min-w-0 flex-1 truncate">{other.title}</span>
									<span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
										{other.detail}
									</span>
								</button>
							</li>
						))}
					</ul>
				</nav>
			) : null}
		</DocumentShell>
	)
}
