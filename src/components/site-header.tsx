import { Download, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getCvHref } from '@/lib/cv'

const getInitialTheme = () => {
	if (typeof window === 'undefined') {
		return false
	}

	try {
		const storedTheme = window.localStorage.getItem('theme')

		if (storedTheme) {
			return storedTheme === 'dark'
		}
	} catch {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function SiteHeader() {
	const [isDark, setIsDark] = useState(getInitialTheme)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)

		try {
			window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
		} catch {
			return
		}
	}, [isDark])

	const handleThemeToggle = () => {
		setIsDark((currentTheme) => !currentTheme)
	}

	return (
		<header className="bg-background">
			<div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
				<a
					className="font-serif text-lg font-semibold tracking-tight"
					aria-label="Home"
					href="/"
				>
					MH
				</a>
				<div className="ml-auto flex items-center gap-2">
					<Button
						aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
						onClick={handleThemeToggle}
						size="icon"
						type="button"
						variant="ghost"
					>
						{isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
					</Button>
					<Button asChild size="sm">
						<a download href={getCvHref()}>
							<Download aria-hidden="true" />
							Resume
						</a>
					</Button>
				</div>
			</div>
		</header>
	)
}
