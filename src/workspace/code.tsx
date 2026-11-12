import type { ReactNode } from 'react'
import { useWorkspace } from '@/workspace/workspace'

const KEYWORDS = new Set(['as', 'const', 'export', 'from', 'import'])

/**
 * Opens a relative import: a file opens, a folder opens the palette on that
 * folder, like quick open.
 */
function PathLink({
	children,
	className = 'text-syntax-string',
	path,
}: {
	children: ReactNode
	className?: string
	path: string
}) {
	const { open, openPalette } = useWorkspace()
	const target = path.replace(/^\.\//, '')
	const isFolder = !target.includes('.')

	return (
		<button
			className={`cursor-pointer underline decoration-line-number/40 underline-offset-2 hover:decoration-current ${className}`}
			data-follow
			onClick={() => (isFolder ? openPalette(`${target}/`) : open(target))}
			title={isFolder ? `Search ${target}/` : `Open ${target}`}
			type="button"
		>
			{children}
		</button>
	)
}

/** A string literal; emails, URLs and relative paths become links. */
function renderString(quoted: string, key: string): ReactNode {
	const value = quoted.slice(1, -1)
	const linkClass =
		'text-syntax-string underline decoration-line-number/40 underline-offset-2 hover:decoration-current'

	if (value.startsWith('./')) {
		return (
			<PathLink key={key} path={value}>
				{quoted}
			</PathLink>
		)
	}

	if (/^[^@\s]+@[^@\s]+$/.test(value)) {
		return (
			<a className={linkClass} href={`mailto:${value}`} key={key}>
				{quoted}
			</a>
		)
	}

	if (/^https?:\/\//.test(value)) {
		return (
			<a
				className={linkClass}
				href={value}
				key={key}
				rel="noreferrer"
				target="_blank"
			>
				{quoted}
			</a>
		)
	}

	return (
		<span className="text-syntax-string" key={key}>
			{quoted}
		</span>
	)
}

const TOKEN = /('[^']*')|(\/\/.*$)|([A-Za-z_$][\w$]*)(\s*:)?/g

/**
 * Syntax-highlights one TypeScript line. The text content of the result is
 * always exactly `text`, so caret offsets map 1:1 onto columns.
 */
export function highlightTypeScript(
	text: string,
	/** Imported names and their paths: uses of them go to the import. */
	imports: Readonly<Record<string, string>> = {},
): ReactNode {
	const isImport = /^\s*import\b/.test(text)

	// Doc comment lines: `/**`, ` * …`, ` */`.
	if (/^\s*(\/\*\*|\*\/|\*( |$))/.test(text)) {
		return <span className="text-syntax-comment">{text}</span>
	}

	const nodes: ReactNode[] = []
	let last = 0

	for (const match of text.matchAll(TOKEN)) {
		const index = match.index
		const key = `t${index}`
		const [whole, string, comment, word, colon] = match

		if (index > last) nodes.push(text.slice(last, index))

		if (string) {
			nodes.push(renderString(string, key))
		} else if (comment) {
			nodes.push(
				<span className="text-syntax-comment" key={key}>
					{comment}
				</span>,
			)
		} else if (word && KEYWORDS.has(word)) {
			nodes.push(
				<span className="text-syntax-keyword" key={key}>
					{word}
				</span>,
			)
		} else if (word && colon) {
			// Object keys.
			nodes.push(
				<span className="text-syntax-constant" key={key}>
					{word}
				</span>,
				colon,
			)
		} else if (word && !isImport && imports[word]) {
			nodes.push(
				<PathLink className="text-foreground" key={key} path={imports[word]}>
					{word}
				</PathLink>,
			)
		} else if (word) {
			nodes.push(
				<span
					className={
						/^[A-Z]/.test(word) ? 'text-syntax-variable' : 'text-foreground'
					}
					key={key}
				>
					{word}
				</span>,
			)
		}

		last = index + whole.length
	}

	if (last < text.length) nodes.push(text.slice(last))

	return nodes
}
