import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app'
import { profile } from '@/content/profile'
import { getCvHref } from '@/lib/cv'

afterEach(() => {
	cleanup()
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

describe('digital CV', () => {
	it('places apps before experience and condenses contact into the introduction', () => {
		const { container } = render(<App />)

		expect(
			screen.getByRole('heading', { name: 'Miguel Pestana Henriques' }),
		).toBeVisible()
		expect(screen.getByText('Senior Software Engineer')).toBeVisible()
		expect(screen.getByRole('heading', { name: 'Working on' })).toBeVisible()
		expect(screen.getByRole('heading', { name: 'ReckonX' })).toBeVisible()
		expect(
			within(
				screen
					.getByRole('heading', { name: 'ReckonX' })
					.closest('article') as HTMLElement,
			).getByRole('link', { name: 'Open' }),
		).toHaveAttribute('href', 'https://reckonx.apps.mipestana.com/')
		expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute(
			'data-variant',
			'outline',
		)
		expect(
			Array.from(container.querySelectorAll('main > section')).map(
				(section) => section.id,
			),
		).toEqual(['top', 'apps', 'experience'])
		expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute(
			'href',
			'mailto:miguel.p.henriques.96@gmail.com',
		)
		expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
			'href',
			profile.linkedin,
		)
		expect(container.querySelector('#top #contact')).toContainElement(
			screen.getByRole('link', { name: 'Email me' }),
		)
		expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute(
			'href',
			getCvHref(),
		)
		expect(container.querySelector('#top a[download]')).not.toBeInTheDocument()
		expect(
			screen.queryByRole('link', { name: 'Contact' }),
		).not.toBeInTheDocument()
		expect(screen.queryByText('What I’m working on')).not.toBeInTheDocument()
		for (const heading of [
			'Sharing what I learn.',
			'Certifications',
			'Education',
			'Languages',
		]) {
			expect(
				screen.queryByRole('heading', { name: heading }),
			).not.toBeInTheDocument()
		}
		expect(
			screen.queryByRole('link', { name: 'Speaking' }),
		).not.toBeInTheDocument()
	})

	it('shows every experience entry and its details immediately', () => {
		render(<App />)

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
