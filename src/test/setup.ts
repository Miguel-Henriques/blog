import '@testing-library/jest-dom/vitest'

const storedValues = new Map<string, string>()

Object.defineProperty(window, 'localStorage', {
	value: {
		clear: () => storedValues.clear(),
		getItem: (key: string) => storedValues.get(key) ?? null,
		key: (index: number) => [...storedValues.keys()][index] ?? null,
		get length() {
			return storedValues.size
		},
		removeItem: (key: string) => storedValues.delete(key),
		setItem: (key: string, value: string) => storedValues.set(key, value),
	},
})

Object.defineProperty(window, 'matchMedia', {
	value: (query: string) => ({
		addEventListener: () => undefined,
		dispatchEvent: () => false,
		matches: false,
		media: query,
		onchange: null,
		removeEventListener: () => undefined,
	}),
	writable: true,
})
