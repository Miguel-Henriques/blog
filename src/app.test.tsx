import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app'
import { ExperienceSection } from '@/components/experience-section'
import { profile } from '@/content/profile'
import { getCvHref } from '@/lib/cv'

afterEach(() => {
	cleanup()
	window.history.replaceState({}, '', '/')
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

describe('portfolio', () => {
	it('keeps the introduction focused and shows projects below it', () => {
		const { container } = render(<App />)
		const main = screen.getByRole('main')

		expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(
			profile.name,
		)
		expect(screen.getByText('Looking for my next role')).toBeInTheDocument()
		expect(screen.getByText('Loading next')).toBeVisible()
		expect(
			within(screen.getByRole('contentinfo')).getByText(profile.location),
		).toBeVisible()
		expect(within(main).queryByText(profile.location)).not.toBeInTheDocument()
		expect(
			within(main).getByText('Previous: AWS, Founding Engineer'),
		).toBeVisible()
		expect(screen.queryByText(profile.summary)).not.toBeInTheDocument()
		expect(
			within(main).getByRole('link', { name: 'Working on' }),
		).toHaveAttribute('href', '#apps')
		expect(
			within(screen.getByRole('banner')).queryByRole('link', { name: 'Apps' }),
		).not.toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'Working on' })).toBeVisible()
		expect(screen.getByRole('heading', { name: 'ReckonX' })).toBeVisible()
		expect(container.querySelector('#top article')).not.toBeInTheDocument()
		expect(container.querySelector('#experience')).not.toBeInTheDocument()
		expect(
			Array.from(container.querySelectorAll('main > section')).map(
				(section) => section.id,
			),
		).toEqual(['top', 'apps'])
		expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute(
			'href',
			`mailto:${profile.email}`,
		)
		expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
			'href',
			profile.linkedin,
		)
		expect(
			within(main).getByRole('link', { name: 'View GitHub profile' }),
		).toHaveAttribute('href', profile.github)
		expect(
			within(screen.getByRole('banner')).queryByRole('link', {
				name: 'View GitHub profile',
			}),
		).not.toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute(
			'href',
			getCvHref(),
		)
		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
			'href',
			'/',
		)
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
