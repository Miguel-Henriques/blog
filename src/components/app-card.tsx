import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
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

function RemotePreview({ url, name }: { url: string; name: string }) {
	const [failed, setFailed] = useState(false)
	if (failed) return null
	return (
		<div className="overflow-hidden border-b bg-muted">
			<img
				alt={`${name} preview`}
				className="aspect-video h-auto w-full object-contain"
				decoding="async"
				height={900}
				loading="lazy"
				onError={() => setFailed(true)}
				referrerPolicy="no-referrer"
				src={url}
				width={1600}
			/>
		</div>
	)
}

const statusLabels = {
	'in-development': 'In development',
	'generally-available': 'Generally available',
}

export function AppCard({ app }: AppCardProps) {
	const labels = [
		...new Set([...app.labels, ...(app.openSource ? ['Open source'] : [])]),
	]
	return (
		<article className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card">
			{app.media ? (
				<div className="overflow-hidden border-b bg-muted">
					<Media media={app.media} />
				</div>
			) : app.previewUrl ? (
				<RemotePreview
					key={app.previewUrl}
					url={app.previewUrl}
					name={app.name}
				/>
			) : null}
			<div className="flex flex-1 flex-col p-6">
				<div className="flex items-start justify-between gap-4">
					<h3 className="font-serif text-2xl">{app.name}</h3>
					<Badge variant="secondary">{statusLabels[app.status]}</Badge>
				</div>
				<p className="mt-3 leading-7 text-muted-foreground">
					{app.description}
				</p>
				<div className="mt-auto pt-5">
					<ul className="flex flex-wrap gap-2" aria-label="Labels">
						{labels.map((label) => (
							<li className="rounded-md border px-3 py-1 text-xs" key={label}>
								{label}
							</li>
						))}
					</ul>
					{app.liveUrl || app.githubUrl ? (
						<div className="mt-6 flex flex-wrap items-start justify-start gap-2">
							{app.liveUrl ? (
								<Button
									asChild
									size="sm"
									className="box-border h-8 border border-transparent py-0"
								>
									<a href={app.liveUrl} rel="noreferrer" target="_blank">
										<ExternalLink aria-hidden="true" />
										Open
									</a>
								</Button>
							) : null}
							{app.githubUrl ? (
								<Button
									asChild
									size="sm"
									variant="outline"
									className="box-border h-8 py-0"
								>
									<a href={app.githubUrl} rel="noreferrer" target="_blank">
										<svg
											aria-hidden="true"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M12 .75a11.25 11.25 0 0 0-3.558 21.922c.563.104.768-.244.768-.542 0-.267-.01-.975-.015-1.913-3.13.68-3.791-1.51-3.791-1.51-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.637 1.225 3.279.937.102-.728.393-1.225.715-1.507-2.498-.284-5.124-1.25-5.124-5.566 0-1.23.44-2.234 1.16-3.022-.116-.284-.503-1.429.11-2.978 0 0 .945-.303 3.094 1.155A10.79 10.79 0 0 1 12 6.176c.956.005 1.918.13 2.817.379 2.148-1.458 3.092-1.155 3.092-1.155.614 1.549.227 2.694.112 2.978.722.788 1.158 1.792 1.158 3.022 0 4.327-2.63 5.279-5.136 5.558.404.349.766 1.038.766 2.092 0 1.51-.014 2.728-.014 3.099 0 .3.203.65.774.54A11.252 11.252 0 0 0 12 .75Z" />
										</svg>
										View
									</a>
								</Button>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</article>
	)
}
