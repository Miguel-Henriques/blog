import { useCallback, useEffect, useState } from 'react'

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

export const useTheme = () => {
	const [isDark, setIsDark] = useState(getInitialTheme)

	useEffect(() => {
		document.documentElement.classList.toggle('dark', isDark)

		try {
			window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
		} catch {
			return
		}
	}, [isDark])

	const toggleTheme = useCallback(() => {
		setIsDark((currentTheme) => !currentTheme)
	}, [])

	return { isDark, toggleTheme }
}
