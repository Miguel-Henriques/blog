import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { profile } from '@/content/profile'
import { useTheme } from '@/hooks/use-theme'
import {
	getLayout,
	isTextFile,
	type Layout,
	snapColumn,
	type WorkspaceFile,
} from '@/workspace/blocks'
import { DEFAULT_PATH, getFile } from '@/workspace/files'

export type EditorView = 'preview' | 'source'

export interface Cursor {
	col: number
	/** Column to return to when moving through shorter lines. */
	goal: number
	line: number
	/** Bumped whenever the cursor should be scrolled into view. */
	reveal: number
}

/** Returns true when it handled the key, so the editor cursor stays put. */
export type EditorKeyHandler = (event: KeyboardEvent) => boolean

interface WorkspaceValue {
	closePalette: () => void
	cursor: Cursor
	registerKeyHandler: (handler: EditorKeyHandler) => () => void
	file: WorkspaceFile | null
	/** Whether the editor shows a cursor: code files and markdown source. */
	hasCursor: boolean
	isDark: boolean
	layout: Layout | null
	moveTo: (line: number, col?: number, reveal?: boolean) => void
	open: (path: string | null, line?: number) => void
	openPalette: (query?: string) => void
	palette: { open: boolean; query: string }
	path: string | null
	setView: (view: EditorView) => void
	toggleTheme: () => void
	toggleView: () => void
	view: EditorView
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null)

export const useWorkspace = () => {
	const value = useContext(WorkspaceContext)

	if (!value) {
		throw new Error('useWorkspace must be used inside WorkspaceProvider')
	}

	return value
}

/**
 * Lets a widget at the cursor (a code actions menu, a suggestion list) handle
 * keys before the editor moves the cursor. Active only while `enabled`.
 */
export const useEditorKeys = (handler: EditorKeyHandler, enabled = true) => {
	const { registerKeyHandler } = useWorkspace()
	const latest = useRef(handler)
	latest.current = handler

	useEffect(() => {
		if (!enabled) return
		return registerKeyHandler((event) => latest.current(event))
	}, [enabled, registerKeyHandler])
}

const ROUTE_PREFIX = '#/'
const VIEW_STORAGE_KEY = 'editor-view'
const DEFAULT_TITLE = document.title

/**
 * `#/path` opens a file, `#/` is the empty workspace, no hash is README.md.
 * Any other hash (e.g. the skip link) is not a route: returns undefined.
 */
const parseHash = (hash: string): string | null | undefined => {
	if (!hash) return DEFAULT_PATH
	if (!hash.startsWith(ROUTE_PREFIX)) return undefined

	const path = decodeURIComponent(hash.slice(ROUTE_PREFIX.length))

	if (!path) return null

	return getFile(path) ? path : DEFAULT_PATH
}

const readStoredView = (): EditorView => {
	try {
		return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'source'
			? 'source'
			: 'preview'
	} catch {
		return 'preview'
	}
}

const isTypingTarget = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable ||
		['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
		target.closest('[role="menu"], [role="dialog"], [role="listbox"]') !== null)

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const [path, setPath] = useState<string | null>(
		() => parseHash(window.location.hash) ?? DEFAULT_PATH,
	)
	const [view, setViewState] = useState<EditorView>(readStoredView)
	const [cursor, setCursor] = useState<Cursor>({
		col: 1,
		goal: 1,
		line: 1,
		reveal: 0,
	})
	const [palette, setPalette] = useState({ open: false, query: '' })
	const keyHandlers = useRef<EditorKeyHandler[]>([])
	const { isDark, toggleTheme } = useTheme()
	const pendingLine = useRef<number | null>(null)
	const hasOpenedFile = useRef(false)

	const file = path ? getFile(path) : null
	const layout = isTextFile(file) ? getLayout(file) : null
	const hasCursor =
		file?.kind === 'code' || (file?.kind === 'markdown' && view === 'source')
	const lineCount = layout?.lines.length ?? 0

	useEffect(() => {
		const handleHashChange = () => {
			const nextPath = parseHash(window.location.hash)
			if (nextPath !== undefined) setPath(nextPath)
		}

		window.addEventListener('hashchange', handleHashChange)
		return () => window.removeEventListener('hashchange', handleHashChange)
	}, [])

	// Opening a file puts the cursor on line 1, or on the requested line.
	useEffect(() => {
		const line = pendingLine.current
		pendingLine.current = null

		setCursor((current) => ({
			col: 1,
			goal: 1,
			line: line ?? 1,
			reveal: line ? current.reveal + 1 : current.reveal,
		}))

		if (!line && hasOpenedFile.current) {
			window.scrollTo({ top: 0, behavior: 'instant' })
		}
		hasOpenedFile.current = true

		const opened = path ? getFile(path) : null
		document.title =
			!opened || opened.path === DEFAULT_PATH
				? DEFAULT_TITLE
				: `${opened.title} — ${profile.name}`
	}, [path])

	const moveTo = useCallback(
		(line: number, col = 1, reveal = false) => {
			if (!layout) return

			const nextLine = clamp(line, 1, layout.lines.length)
			const length = layout.lines[nextLine - 1]?.text.length ?? 0

			setCursor((current) => {
				const snapped =
					nextLine !== current.line ? snapColumn(layout, nextLine) : null
				const nextCol = clamp(snapped ?? col, 1, length + 1)
				return {
					col: nextCol,
					goal: nextCol,
					line: nextLine,
					reveal: reveal ? current.reveal + 1 : current.reveal,
				}
			})
		},
		[layout],
	)

	const open = useCallback(
		(nextPath: string | null, line?: number) => {
			if (nextPath === path) {
				if (line) moveTo(line, 1, true)
				return
			}

			pendingLine.current = line ?? null
			setPath(nextPath)

			const hash = `${ROUTE_PREFIX}${nextPath ?? ''}`
			if (window.location.hash !== hash) window.location.hash = hash
		},
		[moveTo, path],
	)

	const setView = useCallback((nextView: EditorView) => {
		setViewState(nextView)
		// Both views reveal the cursor's line: the editor scrolls to it and the
		// preview to the element rendered from it.
		setCursor((current) => ({ ...current, reveal: current.reveal + 1 }))

		try {
			window.localStorage.setItem(VIEW_STORAGE_KEY, nextView)
		} catch {
			return
		}
	}, [])

	const toggleView = useCallback(() => {
		if (file?.kind !== 'markdown') return
		setView(view === 'preview' ? 'source' : 'preview')
	}, [file, setView, view])

	const openPalette = useCallback((query = '') => {
		setPalette({ open: true, query })
	}, [])

	const closePalette = useCallback(() => {
		setPalette((current) => ({ ...current, open: false }))
	}, [])

	const registerKeyHandler = useCallback((handler: EditorKeyHandler) => {
		keyHandlers.current = [...keyHandlers.current, handler]
		return () => {
			keyHandlers.current = keyHandlers.current.filter(
				(entry) => entry !== handler,
			)
		}
	}, [])

	useEffect(() => {
		const lineLength = (line: number) =>
			layout?.lines[line - 1]?.text.length ?? 0

		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase()

			if ((event.metaKey || event.ctrlKey) && !event.altKey) {
				if (key === 'k' && !event.shiftKey) {
					event.preventDefault()
					setPalette((current) => ({ open: !current.open, query: '' }))
				} else if (
					key === 'v' &&
					event.shiftKey &&
					!isTypingTarget(event.target)
				) {
					event.preventDefault()
					toggleView()
				}
				return
			}

			if (
				palette.open ||
				event.altKey ||
				event.metaKey ||
				event.ctrlKey ||
				event.defaultPrevented ||
				isTypingTarget(event.target) ||
				!layout ||
				!hasCursor
			) {
				return
			}

			for (const handler of [...keyHandlers.current].reverse()) {
				if (handler(event)) {
					event.preventDefault()
					return
				}
			}

			const { col, goal, line } = cursor
			const move = (nextLine: number, nextCol: number, nextGoal = nextCol) => {
				event.preventDefault()
				// A button clicked earlier (say, the problems count) keeps focus
				// and would take ↵; moving the cursor hands keys back to the editor.
				if (
					document.activeElement instanceof HTMLElement &&
					document.activeElement !== document.body
				) {
					document.activeElement.blur()
				}
				const snapped = nextLine !== line ? snapColumn(layout, nextLine) : null
				setCursor((current) => ({
					col: snapped ?? nextCol,
					goal: snapped ?? nextGoal,
					line: nextLine,
					reveal: current.reveal + 1,
				}))
			}

			switch (event.key) {
				case 'ArrowUp': {
					const next = Math.max(line - 1, 1)
					move(next, Math.min(goal, lineLength(next) + 1), goal)
					break
				}
				case 'ArrowDown': {
					const next = Math.min(line + 1, lineCount)
					move(next, Math.min(goal, lineLength(next) + 1), goal)
					break
				}
				case 'ArrowLeft':
					if (col > 1) move(line, col - 1)
					else if (line > 1) move(line - 1, lineLength(line - 1) + 1)
					else event.preventDefault()
					break
				case 'ArrowRight':
					if (col <= lineLength(line)) move(line, col + 1)
					else if (line < lineCount) move(line + 1, 1)
					else event.preventDefault()
					break
				case 'Enter': {
					// Follows the link on the cursor's line, like ⌘-click.
					if (event.target !== document.body) break
					const link = document.querySelector<HTMLElement>(
						`[data-editor] [data-line="${line}"] :is(a[href], [data-follow])`,
					)
					if (link) {
						event.preventDefault()
						link.click()
					}
					break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [cursor, hasCursor, layout, lineCount, palette.open, toggleView])

	return (
		<WorkspaceContext.Provider
			value={{
				closePalette,
				cursor,
				file,
				hasCursor,
				isDark,
				layout,
				moveTo,
				open,
				openPalette,
				palette,
				path,
				registerKeyHandler,
				setView,
				toggleTheme,
				toggleView,
				view,
			}}
		>
			{children}
		</WorkspaceContext.Provider>
	)
}
