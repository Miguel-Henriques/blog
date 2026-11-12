import {
	CornerDownLeft,
	Download,
	FolderX,
	Moon,
	Search,
	TextSearch,
	View,
} from 'lucide-react'
import { Dialog } from 'radix-ui'
import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import { FileIcon } from '@/components/code-line'
import { Kbd } from '@/components/ui/kbd'
import { downloadCv } from '@/lib/cv'
import { formatShortcut } from '@/lib/shortcuts'
import { cn } from '@/lib/utils'
import { getLayout, isTextFile } from '@/workspace/blocks'
import { files } from '@/workspace/files'
import { stripMarkdown } from '@/workspace/markdown'
import { useWorkspace } from '@/workspace/workspace'

type Group = 'Files' | 'In files' | 'Commands'

interface PaletteItem {
	detail?: string
	group: Group
	icon: ReactNode
	id: string
	label: string
	run: () => void
	shortcut?: string
}

const MAX_LINE_MATCHES = 8

const matchesAll = (haystack: string, words: readonly string[]) => {
	const text = haystack.toLowerCase()
	return words.every((word) => text.includes(word))
}

export function CommandPalette() {
	const { closePalette, openPalette, palette } = useWorkspace()

	return (
		<Dialog.Root
			onOpenChange={(isOpen) => (isOpen ? openPalette() : closePalette())}
			open={palette.open}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-background/60 backdrop-blur-[2px]" />
				<Dialog.Content
					aria-describedby={undefined}
					className="fixed top-[12vh] left-1/2 z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border bg-card font-ui text-card-foreground shadow-2xl"
				>
					{/* Content unmounts when closed, so each opening starts fresh. */}
					<PaletteBody initialQuery={palette.query} key={palette.query} />
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

function PaletteBody({ initialQuery }: { initialQuery: string }) {
	const { closePalette, file, open, toggleTheme, toggleView, view } =
		useWorkspace()
	const [query, setQuery] = useState(initialQuery)
	const [selected, setSelected] = useState(0)
	const listId = useId()
	const listRef = useRef<HTMLDivElement>(null)

	const items = useMemo(() => {
		const trimmed = query.trim()
		const commandsOnly = trimmed.startsWith('>')
		const text = (commandsOnly ? trimmed.slice(1) : trimmed).trim()
		const words = text.toLowerCase().split(/\s+/).filter(Boolean)

		const commands: PaletteItem[] = [
			...(file?.kind === 'markdown'
				? [
						{
							group: 'Commands' as const,
							icon: <View aria-hidden="true" />,
							id: 'toggle-view',
							label:
								view === 'preview' ? 'Show markdown source' : 'Show preview',
							run: toggleView,
							shortcut: formatShortcut('V', { shift: true }),
						},
					]
				: []),
			{
				group: 'Commands',
				icon: <Moon aria-hidden="true" />,
				id: 'toggle-theme',
				label: 'Toggle light / dark theme',
				run: toggleTheme,
			},
			{
				group: 'Commands',
				icon: <Download aria-hidden="true" />,
				id: 'download-resume',
				label: 'Download resume',
				run: downloadCv,
			},
			{
				group: 'Commands',
				icon: <FolderX aria-hidden="true" />,
				id: 'close-all',
				label: 'Close all files',
				run: () => open(null),
			},
		]
		const matchingCommands = commands.filter((command) =>
			matchesAll(command.label, words),
		)

		if (commandsOnly) return matchingCommands

		const fileItems: PaletteItem[] = files
			.filter((entry) =>
				matchesAll(
					`${entry.path} ${entry.title} ${entry.detail} ${entry.keywords ?? ''}`,
					words,
				),
			)
			.map((entry) => ({
				detail: entry.title === entry.path ? entry.detail : entry.path,
				group: 'Files',
				icon: <FileIcon path={entry.path} />,
				id: `file:${entry.path}`,
				label: entry.title,
				run: () => open(entry.path),
			}))

		const lineItems: PaletteItem[] = []

		if (text.length >= 2) {
			for (const entry of files) {
				if (!isTextFile(entry)) continue

				for (const sourceLine of getLayout(entry).lines) {
					const plain = stripMarkdown(sourceLine.text)
					if (!plain || !matchesAll(plain, words)) continue

					lineItems.push({
						detail: `${entry.path}:${sourceLine.n}`,
						group: 'In files',
						icon: <TextSearch aria-hidden="true" />,
						id: `line:${entry.path}:${sourceLine.n}`,
						label: plain,
						run: () => open(entry.path, sourceLine.n),
					})
				}
			}
		}

		return [
			...fileItems,
			...lineItems.slice(0, MAX_LINE_MATCHES),
			...(words.length > 0 ? matchingCommands : commands),
		]
	}, [file, open, query, toggleTheme, toggleView, view])

	const activeIndex = Math.min(selected, Math.max(items.length - 1, 0))
	const activeItem = items[activeIndex]

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the highlighted option changes.
	useEffect(() => {
		listRef.current
			?.querySelector('[aria-selected="true"]')
			?.scrollIntoView?.({ block: 'nearest' })
	}, [activeIndex])

	const run = (item: PaletteItem | undefined) => {
		if (!item) return
		closePalette()
		item.run()
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			setSelected((activeIndex + 1) % Math.max(items.length, 1))
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			setSelected((activeIndex - 1 + items.length) % Math.max(items.length, 1))
		} else if (event.key === 'Enter') {
			event.preventDefault()
			run(activeItem)
		}
	}

	return (
		<>
			<Dialog.Title className="sr-only">Command palette</Dialog.Title>
			<div className="flex items-center gap-2.5 border-b px-3.5">
				<Search
					aria-hidden="true"
					className="size-4 shrink-0 text-muted-foreground"
				/>
				<input
					aria-activedescendant={
						activeItem ? `${listId}-${activeItem.id}` : undefined
					}
					aria-autocomplete="list"
					aria-controls={listId}
					aria-expanded="true"
					aria-label="Search files, experience and talks"
					autoComplete="off"
					className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
					onChange={(event) => {
						setQuery(event.target.value)
						setSelected(0)
					}}
					onKeyDown={handleKeyDown}
					placeholder="Search experience, talks, resume… or type > for commands"
					role="combobox"
					spellCheck={false}
					value={query}
				/>
			</div>
			<div
				className="max-h-[min(26rem,60vh)] overflow-y-auto p-1.5"
				id={listId}
				ref={listRef}
				role="listbox"
			>
				{items.length === 0 ? (
					<p className="px-3 py-6 text-center text-sm text-muted-foreground">
						No results for “{query.trim()}”
					</p>
				) : null}
				{items.map((item, index) => (
					<PaletteRow
						active={index === activeIndex}
						id={`${listId}-${item.id}`}
						item={item}
						key={item.id}
						onHover={() => setSelected(index)}
						onRun={() => run(item)}
						showGroup={items[index - 1]?.group !== item.group}
					/>
				))}
			</div>
			<div className="hidden items-center gap-4 border-t px-3.5 py-2 text-xs text-muted-foreground sm:flex">
				<span className="inline-flex items-center gap-1.5">
					<Kbd>↑</Kbd>
					<Kbd>↓</Kbd>
					to navigate
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Kbd>
						<CornerDownLeft className="size-3" />
					</Kbd>
					to open
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Kbd>esc</Kbd>
					to close
				</span>
			</div>
		</>
	)
}

function PaletteRow({
	active,
	id,
	item,
	onHover,
	onRun,
	showGroup,
}: {
	active: boolean
	id: string
	item: PaletteItem
	onHover: () => void
	onRun: () => void
	showGroup: boolean
}) {
	return (
		<>
			{showGroup ? (
				<div
					className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
					role="presentation"
				>
					{item.group}
				</div>
			) : null}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: options are driven from the combobox input's keyboard handler. */}
			<div
				aria-selected={active}
				className={cn(
					'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
					active && 'bg-accent text-accent-foreground',
				)}
				id={id}
				onClick={onRun}
				onMouseMove={onHover}
				role="option"
				tabIndex={-1}
			>
				{item.icon}
				<span className="min-w-0 truncate">{item.label}</span>
				{item.detail ? (
					<span className="ml-auto shrink-0 truncate pl-3 text-xs text-muted-foreground max-sm:hidden">
						{item.detail}
					</span>
				) : null}
				{item.shortcut ? (
					<Kbd className={cn(!item.detail && 'ml-auto')}>{item.shortcut}</Kbd>
				) : null}
			</div>
		</>
	)
}
