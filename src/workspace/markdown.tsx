import type { ReactNode } from 'react'

/** Status values get the same colours as the project cards' badges. */
const tagTones: Record<string, 'success' | 'warning'> = {
	'Generally available': 'success',
	'In development': 'warning',
}

const INLINE_TOKEN =
	/(!?\[)([^\]]*)(\]\()([^)]*)(\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(\/\/.*$)/g

function highlightInline(text: string, keyPrefix: string): ReactNode[] {
	const nodes: ReactNode[] = []
	let last = 0

	for (const match of text.matchAll(INLINE_TOKEN)) {
		const index = match.index
		const key = `${keyPrefix}-${index}`

		if (index > last) {
			nodes.push(text.slice(last, index))
		}

		const [whole, open, label, middle, url, close, code, bold, comment] = match

		if (open !== undefined) {
			const external = /^https?:/.test(url ?? '')
			nodes.push(
				<a
					className="rounded-sm hover:bg-secondary [&:hover_.md-link-label]:underline"
					href={url}
					key={key}
					{...(external ? { rel: 'noreferrer', target: '_blank' } : {})}
				>
					<span className="text-line-number">{open}</span>
					<span className="md-link-label text-syntax-string underline-offset-2">
						{label}
					</span>
					<span className="text-line-number">{middle}</span>
					<span className="text-syntax-comment underline decoration-line-number/40 underline-offset-2">
						{url}
					</span>
					<span className="text-line-number">{close}</span>
				</a>,
			)
		} else if (code) {
			// Inline code renders as a squared tag; the backticks stay in the
			// text (zero width) so caret columns still match the source.
			const value = code.slice(1, -1)
			nodes.push(
				<span className="md-tag" data-tone={tagTones[value]} key={key}>
					<span className="md-tick">`</span>
					{value}
					<span className="md-tick">`</span>
				</span>,
			)
		} else if (bold) {
			nodes.push(
				<span className="font-bold text-foreground" key={key}>
					{bold}
				</span>,
			)
		} else if (comment) {
			nodes.push(
				<span className="text-syntax-comment italic" key={key}>
					{comment}
				</span>,
			)
		}

		last = index + whole.length
	}

	if (last < text.length) {
		nodes.push(text.slice(last))
	}

	return nodes
}

/**
 * Syntax-highlights one markdown source line. The text content of the result
 * is always exactly `text`, so caret offsets map 1:1 onto columns.
 */
export function highlightMarkdown(text: string): ReactNode {
	const headingMatch = /^(#{1,6} )(.*)$/.exec(text)

	if (headingMatch) {
		const [, marker = '', rest = ''] = headingMatch
		return (
			<>
				<span className="text-syntax-keyword">{marker}</span>
				<span className="font-bold text-syntax-constant">
					{highlightInline(rest, 'h')}
				</span>
			</>
		)
	}

	const blockMatch = /^(> |- )(.*)$/.exec(text)

	if (blockMatch) {
		const [, marker = '', rest = ''] = blockMatch
		return (
			<>
				<span className="text-syntax-keyword">{marker}</span>
				{highlightInline(rest, 'b')}
			</>
		)
	}

	return highlightInline(text, 'p')
}

/** Plain text of a markdown line, for search results. */
export const stripMarkdown = (text: string) =>
	text
		.replace(/^(#{1,6} |> |- )/, '')
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[`*]/g, '')
		.trim()
