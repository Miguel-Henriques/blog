import { MapPin } from 'lucide-react'
import { HomePage } from '@/components/home-page'
import { SiteHeader } from '@/components/site-header'
import { profile } from '@/content/profile'

export function App() {
	return (
		<div className="flex min-h-svh flex-col">
			<a
				className="sr-only z-50 bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
				href="#main-content"
			>
				Skip to content
			</a>
			<SiteHeader />
			<main className="flex flex-1 flex-col" id="main-content">
				<HomePage />
			</main>
			<footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-8 text-xs text-muted-foreground sm:px-8">
				<span>
					© {new Date().getFullYear()} {profile.name}
				</span>
				<span className="ml-auto inline-flex items-center gap-2">
					<MapPin aria-hidden="true" className="size-3.5" />
					{profile.location}
				</span>
			</footer>
		</div>
	)
}
