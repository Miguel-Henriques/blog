import type { ComponentType, ReactNode } from 'react'

/**
 * Text files (markdown and code) are lists of blocks. Each block owns one or
 * more source lines; the editor numbers them and the cursor moves over them.
 */
export interface Block {
	/** Column the cursor jumps to when it enters the block's first line. */
	caret?: number
	/** A problem on the block's first line, squiggled in the editor. */
	diagnostic?: { col: number; message: string }
	/** Inlay hints per source line, saying what the line does. */
	hints?: readonly (LineHint | undefined)[]
	source: readonly string[]
	symbol?: { level: 1 | 2 | 3; name: string }
	/**
	 * Shown at the caret while the cursor is on the block's first line, like
	 * code actions or suggestions. Remounts each time the cursor arrives.
	 */
	widget?: () => ReactNode
}

/**
 * Faint inline notes after a line's text, like an editor's inlay hints.
 * `idle` shows while the cursor is elsewhere, `active` while it is on the
 * line (keyboard hints, so only where there is a keyboard).
 */
export interface LineHint {
	active?: string
	idle?: string
}

interface FileBase {
	/** One-line description shown in the palette and empty workspace. */
	detail: string
	/** Extra words the palette matches against. */
	keywords?: string
	path: string
	title: string
}

export interface MarkdownFile extends FileBase {
	blocks: readonly Block[]
	kind: 'markdown'
	/** The rendered document, like an editor's markdown preview. */
	Preview: ComponentType
}

export interface CodeFile extends FileBase {
	blocks: readonly Block[]
	kind: 'code'
	language: string
}

export interface BinaryFile extends FileBase {
	kind: 'binary'
	language: string
}

export type TextFile = MarkdownFile | CodeFile
export type WorkspaceFile = TextFile | BinaryFile

export const isTextFile = (
	file: WorkspaceFile | null | undefined,
): file is TextFile => file?.kind === 'markdown' || file?.kind === 'code'

export interface SourceLine {
	n: number
	text: string
}

export interface FileSymbol {
	level: 1 | 2 | 3
	line: number
	name: string
}

export interface Diagnostic extends NonNullable<Block['diagnostic']> {
	line: number
}

export interface Layout {
	diagnostics: readonly Diagnostic[]
	hints: ReadonlyMap<number, LineHint>
	lines: readonly SourceLine[]
	/** Lines whose cursor snaps to a column, from diagnostics and `caret`. */
	snaps: ReadonlyMap<number, number>
	symbols: readonly FileSymbol[]
	widgets: ReadonlyMap<number, () => ReactNode>
}

const layoutCache = new WeakMap<TextFile, Layout>()

/** Numbers every block's lines and collects headings, once per file. */
export const getLayout = (file: TextFile): Layout => {
	const cached = layoutCache.get(file)
	if (cached) return cached

	const diagnostics: Diagnostic[] = []
	const hints = new Map<number, LineHint>()
	const lines: SourceLine[] = []
	const snaps = new Map<number, number>()
	const symbols: FileSymbol[] = []
	const widgets = new Map<number, () => ReactNode>()

	for (const block of file.blocks) {
		const start = lines.length + 1

		if (block.symbol) symbols.push({ ...block.symbol, line: start })
		if (block.diagnostic) diagnostics.push({ ...block.diagnostic, line: start })
		if (block.widget) widgets.set(start, block.widget)

		const snap = block.diagnostic?.col ?? block.caret
		if (snap) snaps.set(start, snap)

		for (const [index, text] of block.source.entries()) {
			const hint = block.hints?.[index]
			if (hint) hints.set(lines.length + 1, hint)
			lines.push({ n: lines.length + 1, text })
		}
	}

	const layout = { diagnostics, hints, lines, snaps, symbols, widgets }
	layoutCache.set(file, layout)
	return layout
}

export const diagnosticAt = (layout: Layout, line: number) =>
	layout.diagnostics.find((diagnostic) => diagnostic.line === line) ?? null

/** Column the cursor jumps to when it enters `line`, if the line asks for one. */
export const snapColumn = (layout: Layout, line: number) =>
	layout.snaps.get(line) ?? null

/** Line of the first heading named `name`, or 1. */
export const symbolLine = (file: TextFile, name: string, level?: number) =>
	getLayout(file).symbols.find(
		(symbol) => symbol.name === name && (!level || symbol.level === level),
	)?.line ?? 1

/* ---------- markdown block builders ---------- */

export const blank = (): Block => ({ source: [''] })

export const heading = (
	level: 1 | 2 | 3,
	text: string,
	source = `${'#'.repeat(level)} ${text}`,
): Block => ({ source: [source], symbol: { level, name: text } })

export const line = (source: string): Block => ({ source: [source] })

export const list = (items: readonly string[]): Block => ({
	source: items.map((item) => `- ${item}`),
})
