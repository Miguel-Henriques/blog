import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AppCard } from '@/components/app-card'

afterEach(cleanup)

describe('app card', () => {
	it('shows development status independently of a live URL', () => {
		render(
			<AppCard
				app={{
					name: 'Preview app',
					description: 'An early release.',
					status: 'in-development',
					labels: ['Web'],
					liveUrl: 'https://example.com',
				}}
			/>,
		)
		expect(screen.getByText('In development')).toBeVisible()
		expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
			'href',
			'https://example.com',
		)
		expect(
			within(screen.getByRole('list', { name: 'Labels' })).getByText('Web'),
		).toBeVisible()
		expect(screen.queryByRole('link', { name: 'View' })).not.toBeInTheDocument()
	})

	it('shows an open source label and repository without requiring a live URL', () => {
		render(
			<AppCard
				app={{
					name: 'CLI',
					description: 'A command line tool.',
					status: 'generally-available',
					labels: ['CLI', 'Open source'],
					openSource: true,
					githubUrl: 'https://github.com/example/cli',
				}}
			/>,
		)
		expect(screen.getByText('Generally available')).toBeVisible()
		expect(screen.getAllByText('Open source')).toHaveLength(1)
		expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
			'href',
			'https://github.com/example/cli',
		)
		expect(screen.queryByRole('link', { name: 'Open' })).not.toBeInTheDocument()
	})
})
