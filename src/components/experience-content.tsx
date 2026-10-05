import { ExternalLink, Images } from 'lucide-react'
import { CompanyLogo } from '@/components/company-logo'
import type {
	ExperienceEntry,
	ExperienceLink,
	ExperienceMedia,
} from '@/content/profile'
import { cn } from '@/lib/utils'

export type ExperiencePosition = ExperienceEntry

interface ExperienceDetailsProps {
	className?: string
	position: ExperiencePosition
}

interface ExperienceIdentityProps {
	position: ExperiencePosition
}

interface ExperienceMetaProps {
	className?: string
	position: ExperiencePosition
}

interface ProjectResourcesProps {
	links?: readonly ExperienceLink[]
	media?: readonly ExperienceMedia[]
}

function ProjectResources({ links, media }: ProjectResourcesProps) {
	return (
		<>
			{links ? (
				<div className="mt-5">
					<p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
						In the press
					</p>
					<div className="mt-3 flex flex-wrap gap-2">
						{links.map((link) => (
							<a
								className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
								href={link.url}
								key={link.url}
								rel="noreferrer"
								target="_blank"
							>
								{link.label}
								<ExternalLink aria-hidden="true" className="size-3.5" />
							</a>
						))}
					</div>
				</div>
			) : null}
			{media ? (
				<div className="mt-5">
					<p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
						<Images aria-hidden="true" className="size-4" />
						Project media
					</p>
					<div className="mt-3 grid gap-3 sm:grid-cols-2">
						{media.map((item) => (
							<figure
								className="group overflow-hidden rounded-lg border bg-muted"
								key={item.src}
							>
								<img
									alt={item.alt}
									className="aspect-[8/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
									loading="lazy"
									src={item.src}
								/>
								<figcaption className="border-t bg-background px-3 py-2 text-xs text-muted-foreground">
									{item.caption}
								</figcaption>
							</figure>
						))}
					</div>
				</div>
			) : null}
		</>
	)
}

export function ExperienceMeta({ className, position }: ExperienceMetaProps) {
	return (
		<div className={cn('text-sm', className)}>
			<p className="font-semibold whitespace-nowrap">{position.startDate}</p>
			<p className="mt-1 text-muted-foreground">{position.location}</p>
		</div>
	)
}

export function ExperienceIdentity({ position }: ExperienceIdentityProps) {
	return (
		<div className="flex items-start gap-4">
			<div className="company-logo-group flex shrink-0">
				{position.logos.map((logo) => (
					<CompanyLogo key={logo} logo={logo} />
				))}
			</div>
			<div className="pt-0.5">
				<h3 className="font-serif text-2xl">{position.role}</h3>
				<p className="mt-1 font-medium text-primary">{position.company}</p>
			</div>
		</div>
	)
}

export function ExperienceDetails({
	className,
	position,
}: ExperienceDetailsProps) {
	return (
		<div className={className}>
			{'highlights' in position && position.highlights ? (
				<ul className="space-y-3 text-muted-foreground">
					{position.highlights.map((highlight) => (
						<li className="flex gap-3 leading-7" key={highlight}>
							<span
								aria-hidden="true"
								className="mt-3 size-1 shrink-0 rounded-full bg-primary"
							/>
							{highlight}
						</li>
					))}
				</ul>
			) : null}
			{'projects' in position && position.projects ? (
				<div className="space-y-6">
					{position.projects.map((project) => {
						return (
							<section
								className="border-l-2 border-border pl-5"
								key={project.name}
							>
								<h4 className="font-semibold">{project.name}</h4>
								<ul className="mt-2 space-y-2 text-muted-foreground">
									{project.highlights.map((highlight) => (
										<li className="leading-7" key={highlight}>
											{highlight}
										</li>
									))}
								</ul>
								<ProjectResources links={project.links} media={project.media} />
							</section>
						)
					})}
				</div>
			) : null}
		</div>
	)
}
