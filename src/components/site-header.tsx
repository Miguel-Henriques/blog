import { Code, Download, Eye, Moon, Search, Sun } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { getCvHref } from '@/lib/cv'
import { formatShortcut } from '@/lib/shortcuts'
import { cn } from '@/lib/utils'
import { type EditorView, useWorkspace } from '@/workspace/workspace'

const viewOptions: { icon: typeof Eye; label: string; value: EditorView }[] = [
	{ icon: Eye, label: 'Preview', value: 'preview' },
	{ icon: Code, label: 'Markdown', value: 'source' },
]

function ViewToggle() {
	const { file, setView, view } = useWorkspace()

	if (file?.kind !== 'markdown') return null

	return (
		<fieldset className="hidden h-8 shrink-0 items-center gap-0.5 rounded-md border bg-card p-0.5 sm:inline-flex">
			<legend className="sr-only">View</legend>
			{viewOptions.map(({ icon: Icon, label, value }) => (
				<button
					aria-pressed={view === value}
					aria-label={label}
					className={cn(
						'inline-flex size-7 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:text-foreground',
						view === value && 'bg-secondary text-foreground',
					)}
					key={value}
					onClick={() => setView(value)}
					title={`${label} (${formatShortcut('V', { shift: true })})`}
					type="button"
				>
					<Icon aria-hidden="true" className="size-3.5" />
				</button>
			))}
		</fieldset>
	)
}

export function SiteHeader() {
	const { isDark, openPalette, toggleTheme } = useWorkspace()
	const searchShortcut = formatShortcut('K')

	return (
		<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
			<div className="page-column flex h-14 items-center gap-3">
				<Breadcrumbs />
				<div className="ml-auto flex shrink-0 items-center gap-1.5">
					<button
						aria-keyshortcuts="Meta+K Control+K"
						aria-label="Search files and commands"
						className="inline-flex h-8 items-center gap-2 rounded-md border bg-card px-2 font-ui text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:px-2.5"
						onClick={() => openPalette()}
						type="button"
					>
						<Search aria-hidden="true" className="size-3.5" />
						<span className="hidden lg:inline">Search</span>
						<Kbd className="hidden sm:inline-flex">{searchShortcut}</Kbd>
					</button>
					<ViewToggle />
					<Button
						aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
						onClick={toggleTheme}
						size="icon"
						type="button"
						variant="ghost"
					>
						{isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
					</Button>
					<Button asChild size="sm">
						<a download href={getCvHref()}>
							<Download aria-hidden="true" />
							<span className="max-sm:sr-only">Resume</span>
						</a>
					</Button>
				</div>
			</div>
		</header>
	)
}
