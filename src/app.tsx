import { Mail, MapPin, Sparkles } from 'lucide-react'
import { AppCard } from '@/components/app-card'
import { ExperienceSection } from '@/components/experience-section'
import { SectionHeading } from '@/components/section-heading'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { apps } from '@/content/apps'
import { profile } from '@/content/profile'

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
					<h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
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
					<div
						className="mt-8 flex scroll-mt-24 items-center gap-3"
						id="contact"
					>
						<span className="mr-1 text-lg font-bold text-foreground">
							Contact
						</span>
						<Button asChild size="icon-lg" variant="outline">
							<a aria-label="Email me" href={`mailto:${profile.email}`}>
								<Mail aria-hidden="true" className="size-5" />
							</a>
						</Button>
						<Button asChild size="icon-lg" variant="outline">
							<a
								aria-label="LinkedIn"
								href={profile.linkedin}
								rel="noreferrer"
								target="_blank"
							>
								<svg
									aria-hidden="true"
									className="size-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96C2 21.32 2.69 22 3.55 22h16.9c.86 0 1.55-.68 1.55-1.52V3.52C22 2.68 21.31 2 20.45 2ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.98 0 3.58 1.96 3.58 4.51v5.26Z" />
								</svg>
								<span className="sr-only">LinkedIn</span>
							</a>
						</Button>
					</div>
				</section>

				<section className="border-y bg-card" id="apps">
					<div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
						<SectionHeading
							description="Experiments, side projects and anything else that can be built with a keyboard and a Cursor subscription."
							eyebrow="Apps"
							title={
								<>
									<span aria-hidden="true" className="mr-3 text-primary">
										$
									</span>
									Working on
									<span aria-hidden="true" className="terminal-cursor" />
								</>
							}
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

				<ExperienceSection />
			</main>
			<footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted-foreground sm:px-8">
				© {new Date().getFullYear()} {profile.name}
			</footer>
		</>
	)
}
