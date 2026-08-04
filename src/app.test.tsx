import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/app'

describe('digital CV', () => {
	it('renders identity, experience, apps, and contact sections', () => {
		render(<App />)

		expect(
			screen.getByRole('heading', {
				name: 'Miguel Pestana Henriques',
			}),
		).toBeVisible()
		expect(screen.getByText('Software Engineer')).toBeVisible()
		expect(
			screen.getByText('Amazon Web Services · Professional Services'),
		).toBeVisible()
		expect(
			screen.getByRole('heading', {
				name: 'Small products, built end to end.',
			}),
		).toBeVisible()
		expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute(
			'href',
			'mailto:miguel.p.henriques.96@gmail.com',
		)
	})
})
