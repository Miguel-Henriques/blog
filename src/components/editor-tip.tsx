import { Info, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useWorkspace } from '@/workspace/workspace'

const STORAGE_KEY = 'tip:editor:hidden'

const readHidden = () => {
	try {
		return window.localStorage.getItem(STORAGE_KEY) === 'true'
	} catch {
		return false
	}
}

/**
 * A VS Code-style notification explaining that the home page is an editor
 * and how to use it. Closing it hides it until the next page load; it only
 * stays hidden for good when "Don't show this again" is ticked.
 */
export function EditorTip() {
	const { cursor, file, layout } = useWorkspace()
	const [dismissed, setDismissed] = useState(readHidden)
	const [dontShowAgain, setDontShowAgain] = useState(false)
	const checkboxId = useId()
	// Steps aside while a menu is open at the cursor, so it covers nothing.
	const menuOpen = layout?.widgets.has(cursor.line) ?? false

	if (dismissed || menuOpen || file?.kind !== 'code') return null

	const dismiss = () => {
		setDismissed(true)
		if (!dontShowAgain) return
		try {
			window.localStorage.setItem(STORAGE_KEY, 'true')
		} catch {
			return
		}
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 sm:bottom-10">
			<div className="mx-auto flex max-w-6xl justify-end px-4 sm:px-6.5">
				<aside
					aria-label="Tip"
					className="pointer-events-auto w-full rounded-md border bg-card p-3.5 font-ui text-[13px] leading-relaxed text-card-foreground shadow-xl sm:w-[23rem]"
				>
					<div className="flex items-start gap-2.5">
						<Info
							aria-hidden="true"
							className="mt-0.5 size-4 shrink-0 text-primary"
						/>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-foreground">
								How to navigate this page
							</p>
							<p className="mt-1 hidden text-muted-foreground sm:block">
								Move the cursor with <Kbd>↑</Kbd> <Kbd>↓</Kbd> or click a line.
								The role and projects lines open menus, and <Kbd>↵</Kbd> follows
								the link on a line.
							</p>
							<p className="mt-1 text-muted-foreground sm:hidden">
								Tap a line to place the cursor. The role and projects lines open
								menus, and underlined values are links.
							</p>
						</div>
						<button
							aria-label="Dismiss tip"
							className="-mt-1 -mr-1 rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
							onClick={dismiss}
							type="button"
						>
							<X aria-hidden="true" className="size-3.5" />
						</button>
					</div>
					<div className="mt-3 flex items-center justify-between gap-3 pl-6.5">
						<label
							className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none hover:text-foreground"
							htmlFor={checkboxId}
						>
							<input
								checked={dontShowAgain}
								className="size-3.5 cursor-pointer accent-primary"
								id={checkboxId}
								onChange={(event) => setDontShowAgain(event.target.checked)}
								type="checkbox"
							/>
							Don’t show this again
						</label>
						<Button onClick={dismiss} size="sm" type="button">
							Got it
						</Button>
					</div>
				</aside>
			</div>
		</div>
	)
}
