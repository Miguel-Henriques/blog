import { Code2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AppEntry, AppMedia } from '@/content/apps'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface AppCardProps {
	app: AppEntry
}

function Media({ media }: { media: AppMedia }) {
	const isReducedMotion = useReducedMotion()

	if (media.type === 'video' && media.videoSources) {
		return (
			<video
				aria-label={media.alt}
				autoPlay={!isReducedMotion}
				className="aspect-video h-auto w-full object-cover"
				height={media.height}
				loop
				muted
				playsInline
				poster={media.poster}
				preload="metadata"
				width={media.width}
			>
				{media.videoSources.webm ? (
					<source src={media.videoSources.webm} type="video/webm" />
				) : null}
				<source src={media.videoSources.mp4} type="video/mp4" />
			</video>
		)
	}

	if (media.type === 'image' && media.imageSources) {
		return (
			<img
				alt={media.alt}
				className="aspect-video h-auto w-full object-cover"
				decoding="async"
				height={media.height}
				loading="lazy"
				src={media.imageSources.avif}
				width={media.width}
			/>
		)
	}

	return null
}

export function AppCard({ app }: AppCardProps) {
	return (
		<article className="group overflow-hidden rounded-xl border bg-card">
			{app.media ? (
				<div className="overflow-hidden border-b bg-muted">
					<Media media={app.media} />
				</div>
			) : null}
			<div className="p-6">
				<div className="flex items-start justify-between gap-4">
					<h3 className="font-serif text-2xl">{app.name}</h3>
					<Badge variant="secondary">{app.status.replace('-', ' ')}</Badge>
				</div>
				<p className="mt-3 leading-7 text-muted-foreground">
					{app.description}
				</p>
				<ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
					{app.technologies.map((technology) => (
						<li
							className="rounded-full border px-3 py-1 text-xs"
							key={technology}
						>
							{technology}
						</li>
					))}
				</ul>
				{app.liveUrl || app.sourceUrl ? (
					<div className="mt-6 flex flex-wrap gap-2">
						{app.liveUrl ? (
							<Button asChild size="sm">
								<a href={app.liveUrl} rel="noreferrer" target="_blank">
									<ExternalLink aria-hidden="true" />
									Open app
								</a>
							</Button>
						) : null}
						{app.sourceUrl ? (
							<Button asChild size="sm" variant="outline">
								<a href={app.sourceUrl} rel="noreferrer" target="_blank">
									<Code2 aria-hidden="true" />
									View source
								</a>
							</Button>
						) : null}
					</div>
				) : null}
			</div>
		</article>
	)
}
