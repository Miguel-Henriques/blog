import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import '@fontsource/chakra-petch/latin-700.css'
import '@/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error('Root element is missing')
}

createRoot(rootElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
