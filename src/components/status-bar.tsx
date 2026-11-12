import { CircleX, MapPin } from 'lucide-react'
import { profile } from '@/content/profile'
import { useWorkspace } from '@/workspace/workspace'

/**
 * A VS Code-like status bar. The bar spans the window, but its items sit in
 * the same column as the header and the page.
 */
export function StatusBar() {
	const { cursor, file, hasCursor, layout, moveTo, toggleView, view } =
		useWorkspace()
	const problems = layout?.diagnostics ?? []

	return (
		<footer className="z-40 border-t bg-card font-ui text-xs whitespace-nowrap text-muted-foreground sm:sticky sm:bottom-0">
			<div className="mx-auto flex h-7 max-w-6xl items-stretch px-2 sm:px-5">
				{problems.length > 0 ? (
					<button
						aria-label={`${problems.length} ${problems.length === 1 ? 'problem' : 'problems'}, go to the first`}
						className="hidden items-center gap-1.5 px-1.5 hover:text-foreground sm:inline-flex"
						onClick={(event) => {
							// Keep ↵ for the editor rather than this button.
							event.currentTarget.blur()
							const [first] = problems
							if (first) moveTo(first.line, first.col, true)
						}}
						title={problems[0]?.message}
						type="button"
					>
						<CircleX
							aria-hidden="true"
							className="size-3.5 text-syntax-keyword"
						/>
						{problems.length}
					</button>
				) : null}
				<span aria-hidden="true" className="flex-1" />
				{hasCursor ? (
					<span className="hidden items-center px-1.5 md:inline-flex">
						Ln {cursor.line}, Col {cursor.col}
					</span>
				) : null}
				{file?.kind === 'markdown' ? (
					<button
						className="hidden items-center px-1.5 hover:text-foreground md:inline-flex"
						onClick={toggleView}
						title="Toggle preview"
						type="button"
					>
						{view === 'preview' ? 'Markdown Preview' : 'Markdown'}
					</button>
				) : file ? (
					<span className="hidden items-center px-1.5 md:inline-flex">
						{file.language}
					</span>
				) : null}
				<span className="inline-flex items-center gap-1.5 px-1.5">
					<MapPin aria-hidden="true" className="size-3.5" />
					{profile.location}
				</span>
			</div>
		</footer>
	)
}
