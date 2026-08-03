import { useEffect, useState } from 'react'

export const useReducedMotion = () => {
	const [isReducedMotion, setIsReducedMotion] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		const handleChange = () => {
			setIsReducedMotion(mediaQuery.matches)
		}

		handleChange()
		mediaQuery.addEventListener('change', handleChange)

		return () => {
			mediaQuery.removeEventListener('change', handleChange)
		}
	}, [])

	return isReducedMotion
}
