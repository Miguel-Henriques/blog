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

const navigation = [
	{ href: '#experience', label: 'Experience' },
	{ href: '#apps', label: 'Apps' },
	{ href: '#speaking', label: 'Speaking' },
	{ href: '#contact', label: 'Contact' },
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
					href="#"
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
						<a download href="/miguel-henriques-cv.pdf">
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
										href="/miguel-henriques-cv.pdf"
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
