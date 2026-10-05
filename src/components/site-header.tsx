import { Download, Menu, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { profile } from '@/content/profile'
import { getCvHref } from '@/lib/cv'

function GitHubIcon() {
	return (
		<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
			<path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-3.058.559-3.702-1.297-3.702-1.297-.5-1.271-1.221-1.61-1.221-1.61-.998-.682.075-.668.075-.668 1.104.078 1.685 1.133 1.685 1.133.986 1.685 2.586 1.198 3.219.913.099-.71.384-1.2.698-1.477-2.442-.277-5.01-1.221-5.01-5.432 0-1.2.428-2.182 1.128-2.952-.112-.277-.488-1.397.107-2.91 0 0 .919-.294 3.01 1.128A10.5 10.5 0 0 1 12 6.32c.931.004 1.868.126 2.744.369 2.088-1.422 3.006-1.128 3.006-1.128.599 1.513.223 2.633.11 2.91.705.77 1.127 1.752 1.127 2.952 0 4.222-2.572 5.151-5.019 5.423.397.342.75 1.01.75 2.04 0 1.475-.013 2.662-.013 3.025 0 .289.198.623.762.517C19.856 20.974 23 16.86 23 12c0-6.077-4.922-11-11-11Z" />
		</svg>
	)
}

const navigation = [
	{ href: '#apps', label: 'Apps' },
	{ href: '#experience', label: 'Experience' },
] as const

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
		<header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
				<a
					className="font-serif text-lg font-semibold tracking-tight"
					href="#main-content"
				>
					MH
				</a>
				<nav
					aria-label="Primary navigation"
					className="ml-auto hidden items-center gap-7 md:flex"
				>
					{navigation.map((item) => (
						<a
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							href={item.href}
							key={item.href}
						>
							{item.label}
						</a>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-2 md:ml-6">
					<Button asChild size="icon" variant="ghost">
						<a
							aria-label="View GitHub profile"
							href={profile.github}
							rel="noreferrer"
							target="_blank"
						>
							<GitHubIcon />
						</a>
					</Button>
					<Button
						aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
						onClick={handleThemeToggle}
						size="icon"
						type="button"
						variant="ghost"
					>
						{isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
					</Button>
					<Button asChild className="hidden sm:inline-flex" size="sm">
						<a download href={getCvHref()}>
							<Download aria-hidden="true" />
							Resume
						</a>
					</Button>
					<Sheet>
						<SheetTrigger asChild>
							<Button
								aria-label="Open navigation"
								className="md:hidden"
								size="icon"
								type="button"
								variant="ghost"
							>
								<Menu aria-hidden="true" />
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Navigate</SheetTitle>
							</SheetHeader>
							<nav
								aria-label="Mobile navigation"
								className="flex flex-col gap-1 px-4"
							>
								{navigation.map((item) => (
									<SheetClose asChild key={item.href}>
										<a
											className="rounded-md px-3 py-3 text-lg hover:bg-accent"
											href={item.href}
										>
											{item.label}
										</a>
									</SheetClose>
								))}
								<SheetClose asChild>
									<a
										className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-3 text-primary-foreground"
										download
										href={getCvHref()}
									>
										<Download aria-hidden="true" className="size-4" />
										Download resume
									</a>
								</SheetClose>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	)
}
