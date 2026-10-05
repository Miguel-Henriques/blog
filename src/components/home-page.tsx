import { ArrowDown, LoaderCircle, Mail } from 'lucide-react'
import { AppCard } from '@/components/app-card'
import { Button } from '@/components/ui/button'
import { apps } from '@/content/apps'
import { profile } from '@/content/profile'

function GitHubIcon() {
	return (
		<svg
			aria-hidden="true"
			className="size-5"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-3.058.559-3.702-1.297-3.702-1.297-.5-1.271-1.221-1.61-1.221-1.61-.998-.682.075-.668.075-.668 1.104.078 1.685 1.133 1.685 1.133.986 1.685 2.586 1.198 3.219.913.099-.71.384-1.2.698-1.477-2.442-.277-5.01-1.221-5.01-5.432 0-1.2.428-2.182 1.128-2.952-.112-.277-.488-1.397.107-2.91 0 0 .919-.294 3.01 1.128A10.5 10.5 0 0 1 12 6.32c.931.004 1.868.126 2.744.369 2.088-1.422 3.006-1.128 3.006-1.128.599 1.513.223 2.633.11 2.91.705.77 1.127 1.752 1.127 2.952 0 4.222-2.572 5.151-5.019 5.423.397.342.75 1.01.75 2.04 0 1.475-.013 2.662-.013 3.025 0 .289.198.623.762.517C19.856 20.974 23 16.86 23 12c0-6.077-4.922-11-11-11Z" />
		</svg>
	)
}

export function HomePage() {
	return (
		<>
			<section
				className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col items-center justify-center px-5 py-20 text-center sm:items-start sm:px-8 sm:py-28 sm:text-left"
				id="top"
			>
				<h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
					{profile.name}
				</h1>
				<p className="mt-3 flex flex-col flex-wrap items-center justify-center gap-x-3 gap-y-2 text-lg text-muted-foreground sm:flex-row sm:justify-start sm:text-xl">
					<span className="inline-flex items-center gap-2.5 text-foreground">
						<span className="sr-only">Looking for my next role</span>
						<LoaderCircle
							aria-hidden="true"
							className="size-5 text-primary motion-safe:animate-[spin_3s_linear_infinite]"
						/>
						<span aria-hidden="true">
							Loading next <span className="text-muted-foreground">role…</span>
						</span>
					</span>
					<span
						aria-hidden="true"
						className="hidden size-1 rounded-full bg-muted-foreground/50 sm:inline-block"
					/>
					<span>Prev: AWS, Founding Engineer</span>
				</p>
				<div
					className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-start"
					id="contact"
				>
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
					<Button asChild size="icon-lg" variant="outline">
						<a
							aria-label="View GitHub profile"
							href={profile.github}
							rel="noreferrer"
							target="_blank"
						>
							<GitHubIcon />
						</a>
					</Button>
				</div>
				<a
					className="group absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-3 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground sm:bottom-8 sm:left-8 sm:translate-x-0"
					href="#apps"
				>
					<span className="inline-flex size-9 items-center justify-center rounded-full border transition-colors group-hover:border-foreground">
						<ArrowDown
							aria-hidden="true"
							className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-y-0.5"
						/>
					</span>
					Working on
				</a>
			</section>
			<section
				aria-labelledby="working-on-heading"
				className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
				id="apps"
			>
				<h2
					className="text-center font-serif text-3xl tracking-tight sm:text-left sm:text-4xl"
					id="working-on-heading"
				>
					Working on
					<span aria-hidden="true" className="terminal-cursor" />
				</h2>
				{apps.length > 0 ? (
					<div className="mt-10 grid gap-6 lg:grid-cols-2">
						{apps.map((app) => (
							<AppCard app={app} key={app.name} />
						))}
					</div>
				) : (
					<p className="mt-6 text-muted-foreground">
						New projects coming soon.
					</p>
				)}
			</section>
		</>
	)
}
