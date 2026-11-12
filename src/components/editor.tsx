import { Download } from 'lucide-react'
import {
	type CSSProperties,
	type RefObject,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { FileIcon } from '@/components/code-line'
import { LogoCube } from '@/components/root-logo'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { profile } from '@/content/profile'
import { getCvHref } from '@/lib/cv'
import { formatShortcut } from '@/lib/shortcuts'
import { cn } from '@/lib/utils'
import {
	type BinaryFile,
	diagnosticAt,
	type Layout,
	type MarkdownFile,
	snapColumn,
	type TextFile,
} from '@/workspace/blocks'
import { highlightTypeScript } from '@/workspace/code'
import { baseName, files, filesInFolder, folderOf } from '@/workspace/files'
import { highlightMarkdown } from '@/workspace/markdown'
import { useWorkspace } from '@/workspace/workspace'

/** Scrolls the cursor's line into view whenever `cursor.reveal` changes. */
function useRevealCursor(container: RefObject<HTMLElement | null>) {
	const { cursor } = useWorkspace()
	const lastReveal = useRef(cursor.reveal)

	useEffect(() => {
		if (cursor.reveal === lastReveal.current) return
		lastReveal.current = cursor.reveal
		container.current
			?.querySelector(`[data-line="${cursor.line}"]`)
			?.scrollIntoView?.({ behavior: 'instant', block: 'nearest' })
	}, [container, cursor.line, cursor.reveal])
}

/** Places the cursor where the visitor clicks inside the editor. */
function useClickToPlaceCursor(
	container: RefObject<HTMLElement | null>,
	handleClick: (event: MouseEvent) => void,
) {
	const handler = useRef(handleClick)
	handler.current = handleClick

	useEffect(() => {
		const element = container.current
		if (!element) return
		const listener = (event: MouseEvent) => handler.current(event)
		element.addEventListener('click', listener)
		return () => element.removeEventListener('click', listener)
	}, [container])
}

/**
 * The rendered markdown document. There is no cursor here, but revealing a
 * line scrolls to the element rendered from it (or the closest one above).
 */
function PreviewView({ file }: { file: MarkdownFile }) {
	const { cursor } = useWorkspace()
	const ref = useRef<HTMLDivElement>(null)
	const lastReveal = useRef(cursor.reveal)
	const { Preview } = file

	useEffect(() => {
		if (cursor.reveal === lastReveal.current) return
		lastReveal.current = cursor.reveal
		if (cursor.line <= 1) return

		let target: HTMLElement | null = null
		let targetLine = 0
		for (const element of ref.current?.querySelectorAll<HTMLElement>(
			'[data-line]',
		) ?? []) {
			const elementLine = Number(element.dataset.line)
			if (elementLine <= cursor.line && elementLine >= targetLine) {
				target = element
				targetLine = elementLine
			}
		}
		target?.scrollIntoView?.({ behavior: 'instant', block: 'start' })
	}, [cursor.line, cursor.reveal])

	return (
		<div className="content-column pt-12 pb-24" data-editor="preview" ref={ref}>
			<Preview />
		</div>
	)
}

type CaretPositionDocument = Document & {
	caretPositionFromPoint?: (
		x: number,
		y: number,
	) => { offset: number; offsetNode: Node } | null
	caretRangeFromPoint?: (x: number, y: number) => Range | null
}

/** Screen rectangle of the caret before character `offset` of `element`. */
const measureCaret = (element: HTMLElement, offset: number) => {
	const fallback = element.getBoundingClientRect()
	// Inlay hints are not part of the line's text.
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
		acceptNode: (node) =>
			node.parentElement?.closest('[data-inlay]')
				? NodeFilter.FILTER_REJECT
				: NodeFilter.FILTER_ACCEPT,
	})
	let remaining = offset
	let node = walker.nextNode() as Text | null
	let last: Text | null = null

	while (node && remaining > node.length) {
		remaining -= node.length
		last = node
		node = walker.nextNode() as Text | null
	}

	const target = node ?? last
	if (!target) return fallback

	const range = document.createRange()
	range.setStart(target, node ? remaining : target.length)
	range.collapse(true)

	if (typeof range.getClientRects !== 'function') return fallback

	const rect = range.getClientRects()[0] ?? range.getBoundingClientRect()
	return rect.height > 0 ? rect : fallback
}

/** Character offset inside `element` under a click, if any. */
const offsetFromPoint = (element: HTMLElement, x: number, y: number) => {
	const doc = document as CaretPositionDocument
	const position = doc.caretPositionFromPoint?.(x, y)
	const fallback = position ? null : doc.caretRangeFromPoint?.(x, y)
	const node = position?.offsetNode ?? fallback?.startContainer
	const offset = position?.offset ?? fallback?.startOffset

	if (!node || offset === undefined || !element.contains(node)) return null
	if (node.parentElement?.closest('[data-inlay]')) return null

	const range = document.createRange()
	range.setStart(element, 0)
	range.setEnd(node, offset)
	return range.toString().length
}

/** `import name from './path'` lines of a code file, as name → path. */
const getImports = (layout: Layout) =>
	Object.fromEntries(
		layout.lines.flatMap((line) => {
			const match = /^import (\w+) from '([^']+)'/.exec(line.text)
			return match ? [[match[1], match[2]]] : []
		}),
	) as Record<string, string>

interface Rect {
	height: number
	left: number
	top: number
}

/** The editor: numbered lines, a caret, and widgets anchored at the caret. */
function TextView({ file, layout }: { file: TextFile; layout: Layout }) {
	const { cursor, moveTo } = useWorkspace()
	const widget = layout.widgets.get(cursor.line)
	const anchorCol = snapColumn(layout, cursor.line) ?? cursor.col
	const imports = useMemo(() => getImports(layout), [layout])
	const highlight =
		file.kind === 'code'
			? (text: string) => highlightTypeScript(text, imports)
			: highlightMarkdown
	const ref = useRef<HTMLDivElement>(null)
	const [caret, setCaret] = useState<{ anchor: Rect; caret: Rect } | null>(null)
	const [layoutTick, setLayoutTick] = useState(0)
	useRevealCursor(ref)

	useEffect(() => {
		const handleResize = () => setLayoutTick((tick) => tick + 1)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when the file or viewport changes as well as the cursor.
	useLayoutEffect(() => {
		const container = ref.current
		const text = container?.querySelector<HTMLElement>(
			`[data-line="${cursor.line}"] .source-text`,
		)

		if (!container || !text) {
			setCaret(null)
			return
		}

		const box = container.getBoundingClientRect()
		const toRect = (rect: DOMRect): Rect => ({
			height: rect.height,
			left: rect.left - box.left,
			top: rect.top - box.top,
		})
		setCaret({
			anchor: toRect(measureCaret(text, anchorCol - 1)),
			caret: toRect(measureCaret(text, cursor.col - 1)),
		})
	}, [anchorCol, cursor.col, cursor.line, file, layoutTick])

	useClickToPlaceCursor(ref, (event) => {
		const target = event.target as Element
		// Links and buttons in the code act on their own.
		if (target.closest('a, button')) return
		const row = target.closest<HTMLElement>('[data-line]')
		const text = row?.querySelector<HTMLElement>('.source-text')
		if (!row?.dataset.line || !text) return

		const n = Number(row.dataset.line)
		const offset = offsetFromPoint(text, event.clientX, event.clientY)
		moveTo(n, (offset ?? layout.lines[n - 1]?.text.length ?? 0) + 1)
	})

	return (
		<div
			className={cn(
				'content-column relative cursor-text pt-12 font-mono',
				// Room under the last lines only while a widget is open there.
				widget ? 'pb-96' : 'pb-24',
			)}
			data-editor="source"
			ref={ref}
		>
			<h1 className="sr-only">
				{file.kind === 'code'
					? `${profile.name}, ${file.path}`
					: `${file.path}, markdown source`}
			</h1>
			{layout.lines.map((sourceLine) => {
				const isActive = cursor.line === sourceLine.n
				const diagnostic = diagnosticAt(layout, sourceLine.n)
				const hint = layout.hints.get(sourceLine.n)
				const inlay = isActive ? hint?.active : hint?.idle

				return (
					<div
						className="source-line"
						data-active={isActive || undefined}
						data-line={sourceLine.n}
						key={sourceLine.n}
					>
						<span
							className="source-text"
							data-diagnostic={diagnostic ? true : undefined}
							title={diagnostic?.message}
						>
							{highlight(sourceLine.text)}
							{diagnostic ? (
								<span aria-hidden="true" className="diagnostic-squiggle" />
							) : null}
							{inlay ? (
								<span
									aria-hidden="true"
									className="inlay-hint"
									data-inlay
									// Active hints name keys, so they skip touch screens.
									data-keyboard={isActive || undefined}
								>
									{inlay}
								</span>
							) : null}
						</span>
					</div>
				)
			})}
			{caret ? (
				<span
					aria-hidden="true"
					className="editor-caret"
					key={`${cursor.line}:${cursor.col}`}
					style={caret.caret}
				/>
			) : null}
			{caret && widget ? (
				<div
					className="absolute z-30 pt-1.5 max-sm:right-5 max-sm:left-5 sm:left-(--anchor-left) sm:max-w-[calc(100%-var(--anchor-left)-2rem)]"
					// Remounts per line, so widgets start fresh each visit.
					key={`widget:${cursor.line}`}
					style={
						{
							'--anchor-left': `${caret.anchor.left}px`,
							top: caret.anchor.top + caret.anchor.height,
						} as CSSProperties
					}
				>
					{widget()}
				</div>
			) : null}
		</div>
	)
}

function BinaryView({ file }: { file: BinaryFile }) {
	return (
		<div className="content-column pt-16 pb-24" data-editor="binary">
			<h1 className="sr-only">{file.path}</h1>
			<div className="max-w-lg space-y-5 font-ui text-sm text-muted-foreground">
				<p>
					<span className="font-mono text-foreground">{file.path}</span> is a
					binary file and can’t be shown in the editor.
				</p>
				<Button asChild>
					<a download href={getCvHref()}>
						<Download aria-hidden="true" />
						Download resume.pdf
					</a>
				</Button>
			</div>
		</div>
	)
}

function FileButton({ label, path }: { label: string; path: string }) {
	const { open } = useWorkspace()
	const file = files.find((entry) => entry.path === path)

	return (
		<button
			className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-secondary focus-visible:bg-secondary"
			onClick={() => open(path)}
			type="button"
		>
			<FileIcon path={path} />
			<span className="truncate text-foreground">{label}</span>
			<span className="ml-auto hidden max-w-[45%] shrink-0 truncate pl-4 text-right text-xs text-muted-foreground sm:inline">
				{file?.detail}
			</span>
		</button>
	)
}

/** Shown when every file is closed (the root breadcrumb). */
function EmptyWorkspace() {
	const { openPalette } = useWorkspace()
	const rootFiles = filesInFolder('')
	const folders = [
		...new Set(files.map((file) => folderOf(file.path)).filter(Boolean)),
	]

	return (
		<div
			className="content-column flex flex-1 flex-col items-center justify-center gap-8 py-12 font-ui"
			data-editor="empty"
		>
			<LogoCube className="-mb-2" />
			<div className="text-center">
				<h1 className="text-lg text-foreground">No file is open</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Pick one to open, or search everything
					<span className="max-sm:hidden">
						{' '}
						with <Kbd>{formatShortcut('K')}</Kbd>
					</span>
				</p>
			</div>
			<nav aria-label="Workspace files" className="w-full max-w-2xl text-sm">
				<ul className="rounded-lg border bg-card p-1.5">
					{rootFiles
						.filter((file) => file.kind !== 'binary')
						.map((file) => (
							<li key={file.path}>
								<FileButton label={file.path} path={file.path} />
							</li>
						))}
					{folders.map((folder) => (
						<li key={folder}>
							<p className="px-2 pt-2 pb-1 text-xs text-muted-foreground">
								{folder}/
							</p>
							<ul className="border-l pl-2 sm:ml-3">
								{filesInFolder(folder).map((file) => (
									<li key={file.path}>
										<FileButton label={baseName(file.path)} path={file.path} />
									</li>
								))}
							</ul>
						</li>
					))}
					{rootFiles
						.filter((file) => file.kind === 'binary')
						.map((file) => (
							<li key={file.path}>
								<FileButton label={file.path} path={file.path} />
							</li>
						))}
				</ul>
			</nav>
			<dl className="hidden grid-cols-[1fr_auto] gap-x-10 gap-y-2.5 text-sm text-muted-foreground sm:grid">
				<dt>
					<button
						className="hover:text-foreground"
						onClick={() => openPalette()}
						type="button"
					>
						Search files and content
					</button>
				</dt>
				<dd className="text-right">
					<Kbd>{formatShortcut('K')}</Kbd>
				</dd>
				<dt>
					<button
						className="hover:text-foreground"
						onClick={() => openPalette('>')}
						type="button"
					>
						Show all commands
					</button>
				</dt>
				<dd className="flex justify-end gap-1">
					<Kbd>{formatShortcut('K')}</Kbd>
					<Kbd>&gt;</Kbd>
				</dd>
			</dl>
		</div>
	)
}

export function Editor() {
	const { file, layout, view } = useWorkspace()

	if (!file) return <EmptyWorkspace />
	if (file.kind === 'binary') return <BinaryView file={file} />
	if (file.kind === 'markdown' && view === 'preview') {
		return <PreviewView file={file} />
	}
	if (!layout) return null

	return <TextView file={file} layout={layout} />
}
