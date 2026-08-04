import {
	ArrowDown,
	Download,
	ExternalLink,
	Mail,
	MapPin,
	Sparkles,
} from 'lucide-react'
import { AppCard } from '@/components/app-card'
import { CredlyBadge } from '@/components/credly-badge'
import { ExperienceSection } from '@/components/experience-section'
import { SectionHeading } from '@/components/section-heading'
import { SiteHeader } from '@/components/site-header'
import { SpeakingAccordion } from '@/components/speaking-accordion'
import { Button } from '@/components/ui/button'
import { apps } from '@/content/apps'
import { profile } from '@/content/profile'
import { getCvHref } from '@/lib/cv'

export function App() {
	return (
		<>
			<a
				className="sr-only z-50 bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
				href="#main-content"
			>
				Skip to content
			</a>
			<SiteHeader />
			<main id="main-content">
				<section
					className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16"
					id="top"
				>
					<h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
						{profile.name}
					</h1>
					<p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-muted-foreground">
						<span>{profile.role}</span>
						<span
							aria-hidden="true"
							className="hidden size-1 rounded-full bg-muted-foreground/50 sm:inline-block"
						/>
						<span className="inline-flex items-center gap-2">
							<MapPin aria-hidden="true" className="size-4" />
							{profile.location}
						</span>
					</p>
					<p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
						{profile.summary}
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Button asChild>
							<a download href={getCvHref()}>
								<Download aria-hidden="true" />
								Download resume
							</a>
						</Button>
						<Button asChild variant="outline">
							<a href="#apps">
								What I’m working on
								<ArrowDown aria-hidden="true" />
							</a>
						</Button>
					</div>
				</section>

				<ExperienceSection />

				<section className="border-y bg-card" id="apps">
					<div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
						<SectionHeading
							description="A catalog of focused tools and experiments I have designed and built."
							eyebrow="Apps"
							title="Small products, built end to end."
						/>
						{apps.length > 0 ? (
							<div className="mt-14 grid gap-6 lg:grid-cols-2">
								{apps.map((app) => (
									<AppCard app={app} key={app.name} />
								))}
							</div>
						) : (
							<div className="mt-14 rounded-xl border border-dashed bg-background p-10 sm:p-14">
								<Sparkles aria-hidden="true" className="size-6 text-primary" />
								<h3 className="mt-6 font-serif text-2xl">
									The catalog is taking shape.
								</h3>
								<p className="mt-3 max-w-xl leading-7 text-muted-foreground">
									I am preparing the first set of custom-built apps for public
									release. Check back soon.
								</p>
							</div>
						)}
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-5 py-24 sm:px-8" id="speaking">
					<SectionHeading
						description="Sessions and workshops centered on software engineering and cloud computing."
						eyebrow="Public speaking"
						title="Sharing what I learn."
					/>
					<div className="mt-14">
						<SpeakingAccordion events={profile.speaking} />
					</div>
					<div className="mt-20 grid gap-14 border-t pt-16 md:grid-cols-3">
						<div>
							<h2 className="font-serif text-3xl">Certifications</h2>

							<div className="mt-7 flex flex-wrap gap-[2px]">
								{profile.certifications.map((certification) => {
									if (
										!('badgeId' in certification) ||
										!certification.badgeId
									) {
										return null
									}

									return (
										<CredlyBadge
											badgeId={certification.badgeId}
											key={certification.badgeId}
											name={certification.name}
										/>
									)
								})}
							</div>

						</div>
						<div>
							<h2 className="font-serif text-3xl">Education</h2>
							<p className="mt-7 font-semibold">{profile.education.degree}</p>
							<p className="mt-2 text-muted-foreground">
								{profile.education.institution}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{profile.education.period} · {profile.education.location}
							</p>
						</div>
						<div>
							<h2 className="font-serif text-3xl">Languages</h2>
							<p className="mt-7 text-muted-foreground">
								{profile.languages.join(' · ')}
							</p>
						</div>
					</div>
				</section>

				<section
					className="border-t bg-primary text-primary-foreground"
					id="contact"
				>
					<div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
						<p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
							Contact
						</p>
						<h2 className="mt-5 max-w-3xl font-serif text-4xl tracking-tight sm:text-6xl">
							Let’s build something useful.
						</h2>
						<div className="mt-10 flex flex-wrap gap-3">
							<Button asChild size="lg" variant="secondary">
								<a href={`mailto:${profile.email}`}>
									<Mail aria-hidden="true" />
									Email me
								</a>
							</Button>
							<Button
								asChild
								className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
								size="lg"
								variant="outline"
							>
								<a href={profile.linkedin} rel="noreferrer" target="_blank">
									<ExternalLink aria-hidden="true" />
									LinkedIn
								</a>
							</Button>
						</div>
						<div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-primary-foreground/20 pt-6 text-sm opacity-75">
							<p>
								© {new Date().getFullYear()} {profile.name}
							</p>
							<p className="flex items-center gap-2">
								<MapPin aria-hidden="true" className="size-4" />
								{profile.location}
							</p>
						</div>
					</div>
				</section>
			</main>
		</>
	)
}
