import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app'
import { ExperienceSection } from '@/components/experience-section'
import { profile } from '@/content/profile'
import { getCvHref } from '@/lib/cv'

afterEach(() => {
	cleanup()
	window.history.replaceState({}, '', '/')
	window.localStorage.clear()
	vi.useRealTimers()
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

function getExperienceEntry(index = 0) {
	const position = profile.experience[index]
	if (!position) throw new Error('Expected at least one experience entry')
	const heading = screen.getByRole('heading', { name: position.role })
	const entry = heading.closest('article')
	if (!entry) throw new Error('Expected an experience article')
	return entry
}

/** The editor row whose text contains `text`. */
const sourceLine = (container: HTMLElement, text: string) =>
	[...container.querySelectorAll<HTMLElement>('.source-line')].find((row) =>
		row.textContent?.includes(text),
	)

describe('portfolio', () => {
	it('opens miguel.ts with the profile, contact links and projects', () => {
		const { container } = render(<App />)
		const footer = within(screen.getByRole('contentinfo'))

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			`${profile.name}, miguel.ts`,
		)
		expect(sourceLine(container, profile.name)).toBeDefined()
		expect(footer.getByText(profile.location)).toBeVisible()
		expect(footer.getByText('TypeScript')).toBeInTheDocument()
		expect(footer.getByText('Ln 1, Col 1')).toBeInTheDocument()
		expect(
			footer.getByRole('button', { name: '1 problem, go to the first' }),
		).toBeInTheDocument()

		// Contact values are links; code files have no preview toggle.
		expect(
			screen.getByRole('link', { name: `'${profile.email}'` }),
		).toHaveAttribute('href', `mailto:${profile.email}`)
		expect(
			screen.getByRole('link', { name: `'${profile.linkedin}'` }),
		).toHaveAttribute('target', '_blank')
		expect(
			screen.getByRole('link', { name: `'${profile.github}'` }),
		).toHaveAttribute('href', profile.github)
		expect(screen.queryByRole('button', { name: 'Markdown' })).toBeNull()

		const banner = within(screen.getByRole('banner'))
		expect(banner.getByRole('link', { name: 'Resume' })).toHaveAttribute(
			'href',
			getCvHref(),
		)
		const breadcrumb = within(
			screen.getByRole('navigation', { name: 'Breadcrumb' }),
		)
		expect(
			breadcrumb.getByRole('button', { name: 'miguel.ts, switch file' }),
		).toBeVisible()
		expect(breadcrumb.getAllByRole('button')).toHaveLength(2)
	})

	it('explains the editor in a tip on every load unless told not to', () => {
		render(<App />)
		const tip = () => screen.queryByRole('complementary', { name: 'Tip' })

		expect(
			within(tip() as HTMLElement).getByText('How to navigate this page'),
		).toBeVisible()

		// It steps aside while a menu is open at the cursor.
		fireEvent.click(sourceLine(document.body, 'projects:') as HTMLElement)
		expect(tip()).toBeNull()
		fireEvent.click(sourceLine(document.body, 'talks,') as HTMLElement)
		expect(tip()).not.toBeNull()

		// Closing hides it until the next page load.
		fireEvent.click(screen.getByRole('button', { name: 'Got it' }))
		expect(tip()).toBeNull()
		cleanup()
		render(<App />)
		expect(tip()).not.toBeNull()

		// Ticking "Don't show this again" keeps it hidden after reloads.
		fireEvent.click(
			screen.getByRole('checkbox', { name: 'Don’t show this again' }),
		)
		fireEvent.click(screen.getByRole('button', { name: 'Dismiss tip' }))
		expect(tip()).toBeNull()
		cleanup()
		render(<App />)
		expect(tip()).toBeNull()
	})

	it('hints at what each line of miguel.ts does', () => {
		const { container } = render(<App />)
		const hintOn = (text: string) =>
			sourceLine(container, text)?.querySelector('[data-inlay]')?.textContent

		// The role and projects lines always say they do something.
		expect(hintOn('role:')).toBe('looking for my next role · quick fix')
		expect(hintOn('projects:')).toBe('browse 2 projects')
		expect(hintOn('email:')).toBeUndefined()

		// Link lines say what ↵ does once the cursor is on them.
		fireEvent.click(sourceLine(container, 'email:') as HTMLElement)
		expect(hintOn('email:')).toBe('↵ write an email')

		// On the role line the code actions take over from the hint.
		fireEvent.click(sourceLine(container, 'role:') as HTMLElement)
		expect(hintOn('role:')).toBeUndefined()
		expect(screen.getByRole('group', { name: 'Code actions' })).toBeVisible()
	})

	it('follows import paths and links from the code', () => {
		const opened: string[] = []
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement,
		) {
			opened.push(this.href)
		})
		const { container } = render(<App />)

		// ↵ follows the link on the cursor's line.
		fireEvent.click(sourceLine(container, 'email:') as HTMLElement)
		fireEvent.keyDown(document.body, { key: 'Enter' })
		expect(opened).toEqual([`mailto:${profile.email}`])

		// A folder import searches that folder.
		fireEvent.click(screen.getByRole('button', { name: "'./talks'" }))
		expect(screen.getByRole('combobox')).toHaveValue('talks/')
		fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })

		fireEvent.click(screen.getByRole('button', { name: "'./experience.md'" }))
		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' }),
		).toBeVisible()
		expect(window.location.hash).toBe('#/experience.md')
	})

	it('follows imported names with ↵, even after using the problems button', () => {
		const { container } = render(<App />)
		const footer = within(screen.getByRole('contentinfo'))
		const press = (key: string) => fireEvent.keyDown(document.body, { key })
		const problems = footer.getByRole('button', {
			name: '1 problem, go to the first',
		})

		// The problems button jumps to the role and then lets go of the keys.
		problems.focus()
		fireEvent.click(problems)
		expect(document.activeElement).not.toBe(problems)
		expect(footer.queryByText('Open to work')).toBeNull()

		press('Escape')
		press('ArrowUp')
		const talksLine = Number(sourceLine(container, 'talks,')?.dataset.line)
		expect(
			footer.getByText(new RegExp(`^Ln ${talksLine},`)),
		).toBeInTheDocument()
		press('Enter')
		expect(screen.getByRole('combobox')).toHaveValue('talks/')
		fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })

		press('ArrowUp')
		press('Enter')
		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' }),
		).toBeVisible()
	})

	it('renders markdown as a document and toggles to its source', () => {
		window.history.replaceState({}, '', '/#/experience.md')
		const { container } = render(<App />)
		const footer = within(screen.getByRole('contentinfo'))

		// The preview is a document: no gutter, cursor or markdown markers.
		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' }),
		).toBeVisible()
		expect(container.querySelector('.source-line')).toBeNull()
		expect(screen.queryByText(/^## /)).toBeNull()
		expect(footer.queryByText(/^Ln /)).toBeNull()
		expect(footer.getByText('Markdown Preview')).toBeInTheDocument()
		const [position] = profile.experience
		expect(
			screen.getByRole('heading', { level: 2, name: position?.role }),
		).toBeVisible()

		fireEvent.click(screen.getByRole('button', { name: 'Markdown' }))

		expect(
			container.querySelector('[data-line="1"] .source-text'),
		).toHaveTextContent('# Experience')
		expect(footer.getByText('Ln 1, Col 1')).toBeInTheDocument()
		const certification = sourceLine(container, 'credly.com')
		expect(certification?.querySelector('a')).toHaveAttribute(
			'target',
			'_blank',
		)

		fireEvent.keyDown(document.body, {
			key: 'V',
			metaKey: true,
			shiftKey: true,
		})

		expect(container.querySelector('.source-line')).toBeNull()
		expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute(
			'aria-pressed',
			'true',
		)
	})

	it('moves the cursor with the arrow keys and snaps to the missing role value', () => {
		const { container } = render(<App />)
		const footer = within(screen.getByRole('contentinfo'))
		const press = (key: string) => fireEvent.keyDown(document.body, { key })
		const roleLine = Number(sourceLine(container, 'role:')?.dataset.line)

		press('ArrowRight')
		press('ArrowRight')
		expect(footer.getByText('Ln 1, Col 3')).toBeInTheDocument()

		for (let line = 1; line < roleLine; line++) press('ArrowDown')
		expect(footer.getByText(`Ln ${roleLine}, Col 9`)).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'Code actions' })).toBeVisible()

		// Up passes through the code actions while nothing is selected.
		press('ArrowUp')
		expect(footer.getByText(`Ln ${roleLine - 1}, Col 9`)).toBeInTheDocument()
		expect(screen.queryByRole('group', { name: 'Code actions' })).toBeNull()
		press('ArrowLeft')
		expect(footer.getByText(`Ln ${roleLine - 1}, Col 8`)).toBeInTheDocument()
	})

	it('offers previous roles as code actions on the empty role value', () => {
		const { container } = render(<App />)
		const press = (key: string) => fireEvent.keyDown(document.body, { key })

		fireEvent.click(sourceLine(container, 'role:') as HTMLElement)
		const actions = screen.getByRole('group', { name: 'Code actions' })
		expect(within(actions).getByText('Finding next role…')).toBeVisible()
		expect(
			within(actions).getByRole('button', { name: /Founding Engineer/ }),
		).toBeVisible()

		press('Escape')
		expect(screen.queryByRole('group', { name: 'Code actions' })).toBeNull()

		press('ArrowUp')
		press('ArrowDown')
		press('ArrowDown')
		press('Enter')

		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' }),
		).toBeVisible()
		// The cursor is on the role's heading, shown in the markdown source.
		fireEvent.click(screen.getByRole('button', { name: 'Markdown' }))
		expect(
			within(screen.getByRole('contentinfo')).getByText('Ln 5, Col 1'),
		).toBeInTheDocument()
	})

	it('suggests projects at the cursor on the projects line', () => {
		const opened: string[] = []
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement,
		) {
			opened.push(this.href)
		})
		const { container } = render(<App />)
		const press = (key: string) => fireEvent.keyDown(document.body, { key })
		const footer = within(screen.getByRole('contentinfo'))
		const projectsLine = sourceLine(container, 'projects:') as HTMLElement
		const n = Number(projectsLine.dataset.line)
		const menu = () => screen.queryByRole('listbox', { name: 'Projects' })
		const selected = () =>
			within(menu() as HTMLElement).getByRole('option', { selected: true })

		expect(menu()).toBeNull()

		// The cursor lands inside the array, where the menu opens.
		fireEvent.click(projectsLine)
		expect(footer.getByText(`Ln ${n}, Col 14`)).toBeInTheDocument()
		expect(within(menu() as HTMLElement).getAllByRole('option')).toHaveLength(2)
		expect(selected()).toHaveTextContent('ReckonX')
		expect(screen.getByRole('heading', { name: 'ReckonX' })).toBeVisible()

		// ↓ picks the next project; the cursor stays on the line.
		press('ArrowDown')
		expect(selected()).toHaveTextContent('Commands')
		expect(screen.getByRole('heading', { name: 'Commands' })).toBeVisible()
		expect(screen.queryByRole('heading', { name: 'ReckonX' })).toBeNull()
		expect(footer.getByText(`Ln ${n}, Col 14`)).toBeInTheDocument()

		// ↵ opens the selected project.
		press('Enter')
		expect(opened).toHaveLength(1)

		// Clicking a row selects it without moving the cursor.
		fireEvent.click(within(menu() as HTMLElement).getByText('ReckonX'))
		expect(selected()).toHaveTextContent('ReckonX')
		expect(footer.getByText(`Ln ${n}, Col 14`)).toBeInTheDocument()

		// Above the first project ↑ leaves the line, and the menu closes.
		press('ArrowUp')
		expect(footer.getByText(`Ln ${n - 1}, Col 9`)).toBeInTheDocument()
		expect(menu()).toBeNull()

		// Esc dismisses it until the cursor comes back.
		fireEvent.click(projectsLine)
		press('Escape')
		expect(menu()).toBeNull()
		fireEvent.click(sourceLine(container, 'talks,') as HTMLElement)
		fireEvent.click(projectsLine)
		expect(menu()).not.toBeNull()
	})

	it('finds talks and experience from the command palette', () => {
		render(<App />)

		fireEvent.keyDown(document.body, { key: 'k', metaKey: true })
		const input = screen.getByRole('combobox')
		fireEvent.change(input, { target: { value: 'zero trust seattle' } })

		expect(
			screen.getByRole('option', {
				name: /Zero Trust Web Application Development/,
			}),
		).toBeInTheDocument()

		fireEvent.keyDown(input, { key: 'Enter' })

		expect(
			screen.getByRole('heading', {
				level: 1,
				name: 'Zero Trust Web Application Development',
			}),
		).toBeVisible()
		expect(window.location.hash).toBe('#/talks/amazon-devcon-seattle-2024.md')
		expect(
			screen.getByRole('button', { name: 'talks folder' }),
		).toBeInTheDocument()

		vi.spyOn(Element.prototype, 'scrollIntoView')
		fireEvent.keyDown(document.body, { key: 'k', metaKey: true })
		fireEvent.change(screen.getByRole('combobox'), {
			target: { value: 'TP ICAP' },
		})
		fireEvent.click(
			screen.getByRole('option', { name: /Fusion Platform · TP ICAP/ }),
		)

		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' }),
		).toBeVisible()
		// The preview scrolls to the matching line.
		expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
	})

	it('opens the palette with ⌘K only', () => {
		render(<App />)

		fireEvent.keyDown(document.body, { key: 'p', metaKey: true })
		expect(screen.queryByRole('combobox')).toBeNull()

		fireEvent.keyDown(document.body, { key: 'k', metaKey: true })
		expect(screen.getByRole('combobox')).toBeVisible()
	})

	it('closes every file from the root breadcrumb and lists what can be opened', () => {
		render(<App />)

		fireEvent.click(
			screen.getByRole('button', { name: 'Miguel Henriques, close all files' }),
		)

		expect(
			screen.getByRole('heading', { level: 1, name: 'No file is open' }),
		).toBeVisible()
		expect(window.location.hash).toBe('#/')
		expect(screen.queryByText('Toggle theme')).toBeNull()

		const fileList = screen.getByRole('navigation', { name: 'Workspace files' })
		fireEvent.click(
			within(fileList).getByRole('button', { name: /experience\.md/ }),
		)

		expect(
			screen.getByRole('heading', { level: 1, name: 'Experience' }),
		).toBeVisible()
	})

	it('preserves the experience component and its details for future use', () => {
		render(<ExperienceSection />)

		for (const [index, position] of profile.experience.entries()) {
			const entry = getExperienceEntry(index)
			expect(within(entry).getByText(position.startDate)).toBeVisible()
			expect(within(entry).getByText(position.company)).toBeVisible()
			expect(entry.querySelector('[inert], [aria-hidden="true"] a')).toBeNull()
			for (const description of [
				...(position.highlights ?? []),
				...(position.projects ?? []).flatMap((project) => project.highlights),
			]) {
				expect(within(entry).getByText(description)).toBeVisible()
			}
		}
	})
})
