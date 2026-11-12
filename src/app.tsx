import { CommandPalette } from '@/components/command-palette'
import { Editor } from '@/components/editor'
import { EditorTip } from '@/components/editor-tip'
import { SiteHeader } from '@/components/site-header'
import { StatusBar } from '@/components/status-bar'
import { WorkspaceProvider } from '@/workspace/workspace'

export function App() {
	return (
		<WorkspaceProvider>
			<div className="flex min-h-svh flex-col">
				<a
					className="sr-only z-50 bg-background px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
					href="#main-content"
				>
					Skip to content
				</a>
				<SiteHeader />
				<main className="flex flex-1 flex-col" id="main-content">
					<Editor />
				</main>
				<StatusBar />
			</div>
			<EditorTip />
			<CommandPalette />
		</WorkspaceProvider>
	)
}
