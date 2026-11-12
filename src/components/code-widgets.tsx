import {
	Box,
	ExternalLink,
	History,
	Lightbulb,
	LoaderCircle,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { statusLabels } from '@/components/app-card'
import { apps } from '@/content/apps'
import { cn } from '@/lib/utils'
import { useEditorKeys, useWorkspace } from '@/workspace/workspace'

export interface PreviousRole {
	company: string
	/** Line of the role's heading in experience.md. */
	line: number
	role: string
}

export const ROLE_DIAGNOSTIC = "Expression expected: 'role' has no value yet."

/* ---------- var role = ---------- */

/**
 * VS Code-style code actions for the empty `role` value: a spinner that
 * never finishes, then previous roles that open experience.md. ↑/↓ select
 * (and fall through to the editor at either end), ↵ opens, esc dismisses.
 */
export function RoleCodeActions({
	className,
	roles,
}: {
	className?: string
	roles: readonly PreviousRole[]
}) {
	const { open } = useWorkspace()
	const [selected, setSelected] = useState(-1)
	const [dismissed, setDismissed] = useState(false)

	useEditorKeys((event) => {
		switch (event.key) {
			case 'Escape':
				setDismissed(true)
				return true
			case 'ArrowDown':
				if (selected >= roles.length - 1) return false
				setSelected(selected + 1)
				return true
			case 'ArrowUp':
				if (selected < 0) return false
				setSelected(selected - 1)
				return true
			case 'Enter': {
				const role = roles[selected]
				if (!role) return false
				open('experience.md', role.line)
				return true
			}
			default:
				return false
		}
	}, !dismissed)

	if (dismissed) return null

	return (
		// biome-ignore lint/a11y/useSemanticElements: rendered inside inline text, where a fieldset is not allowed.
		<span
			aria-label="Code actions"
			className={cn(
				'z-30 block w-[min(25rem,calc(100vw-2.5rem))] rounded-md border bg-card p-1 text-left font-ui text-[13px] leading-normal font-normal not-italic text-card-foreground shadow-xl',
				className,
			)}
			role="group"
		>
			<span className="flex items-center gap-1.5 px-2 pt-1 pb-1.5 text-[11px] text-muted-foreground">
				<Lightbulb aria-hidden="true" className="size-3.5 text-warning" />
				Quick fix
			</span>
			<span
				aria-live="polite"
				className="flex items-center gap-2 rounded-sm bg-secondary/60 px-2 py-1.5 text-foreground"
			>
				<LoaderCircle
					aria-hidden="true"
					className="size-3.5 shrink-0 text-primary motion-safe:animate-spin"
				/>
				Finding next role…
			</span>
			<span className="mt-1 block border-t px-2 pt-2 pb-1 text-[11px] tracking-wide text-muted-foreground uppercase">
				Previous roles
			</span>
			{roles.map((role, index) => (
				<button
					className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground"
					data-selected={index === selected || undefined}
					key={role.line}
					onClick={() => open('experience.md', role.line)}
					onMouseEnter={() => setSelected(index)}
					type="button"
				>
					<History
						aria-hidden="true"
						className="size-3.5 shrink-0 text-muted-foreground"
					/>
					<span className="truncate">{role.role}</span>
					<span className="ml-auto truncate pl-3 text-xs text-muted-foreground">
						{role.company}
					</span>
				</button>
			))}
			<span className="mt-1 hidden border-t px-2 pt-1.5 pb-0.5 text-[11px] text-muted-foreground sm:block">
				↑↓ select · ↵ open in experience.md · esc dismiss
			</span>
		</span>
	)
}

/* ---------- projects: [ … ] ---------- */

type App = (typeof apps)[number]

function ProjectRow({
	app,
	onSelect,
	selected,
}: {
	app: App
	onSelect: () => void
	selected: boolean
}) {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: the editor's ↑/↓ keys select rows; the menu never takes focus.
		<div
			aria-selected={selected}
			className={cn(
				'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-left',
				selected ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary',
			)}
			onClick={onSelect}
			role="option"
			tabIndex={-1}
		>
			<Box
				aria-hidden="true"
				className={cn(
					'size-3.5 shrink-0',
					selected ? 'text-current' : 'text-syntax-variable',
				)}
			/>
			<span className="truncate">{app.name}</span>
		</div>
	)
}

const linkLabel = (url: string) =>
	url.replace(/^https?:\/\//, '').replace(/\/$/, '')

/**
 * The selected project, styled like the editor's details pane: the same
 * monospace type and syntax colours as the code, status as a squared tag.
 */
function ProjectDetails({ app }: { app: App }) {
	const links = [app.liveUrl, app.githubUrl].filter((url): url is string =>
		Boolean(url),
	)
	const labels = [...new Set(app.labels)]

	return (
		<article className="flex h-full flex-col gap-3 p-3.5">
			<div className="flex items-start justify-between gap-3">
				<h3 className="font-semibold text-syntax-variable">{app.name}</h3>
				<span
					className="md-tag shrink-0"
					data-tone={app.status === 'in-development' ? 'warning' : 'success'}
				>
					{statusLabels[app.status]}
				</span>
			</div>
			<p className="text-muted-foreground">
				{app.description.replace(/\s+/g, ' ').trim()}
			</p>
			<ul aria-label="Labels" className="flex flex-wrap gap-1.5">
				{labels.map((label) => (
					<li className="md-tag" key={label}>
						{label}
					</li>
				))}
			</ul>
			{links.length > 0 ? (
				<ul className="mt-auto space-y-1 border-t pt-3">
					{links.map((url) => (
						<li key={url}>
							<a
								className="inline-flex max-w-full items-center gap-1.5 text-syntax-string underline decoration-line-number/40 underline-offset-2 hover:decoration-current"
								href={url}
								rel="noreferrer"
								target="_blank"
							>
								<ExternalLink aria-hidden="true" className="size-3 shrink-0" />
								<span className="truncate">{linkLabel(url)}</span>
							</a>
						</li>
					))}
				</ul>
			) : null}
		</article>
	)
}

/**
 * IntelliSense-style suggestions at the cursor: a narrow project list on the
 * left and the selected project's details on the right.
 */
function ProjectsMenu({
	className,
	onSelect,
	selected,
}: {
	className?: string
	onSelect: (index: number) => void
	selected: number
}) {
	const app = apps[selected]
	return (
		<div
			className={cn(
				'w-[34rem] max-w-full overflow-hidden rounded-md border bg-card text-left font-mono text-[13px] leading-normal font-normal shadow-xl',
				className,
			)}
		>
			<div className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)]">
				<div
					aria-label="Projects"
					className="border-b p-1 sm:border-r sm:border-b-0"
					role="listbox"
				>
					{apps.map((entry, index) => (
						<ProjectRow
							app={entry}
							key={entry.name}
							onSelect={() => onSelect(index)}
							selected={index === selected}
						/>
					))}
				</div>
				<div className="bg-background">
					{app ? <ProjectDetails app={app} /> : null}
				</div>
			</div>
			<div className="hidden border-t px-2.5 py-1 font-ui text-[11px] text-muted-foreground sm:block">
				↑↓ select · ↵ open · esc dismiss
			</div>
		</div>
	)
}

/**
 * Suggestions for the `projects` value, shown at the cursor while it is on
 * that line: ↑/↓ pick a project (and leave the line past either end), ↵ opens
 * it, esc dismisses until the cursor comes back.
 */
export function ProjectsSuggest({ className }: { className?: string }) {
	const [selected, setSelected] = useState(0)
	const [dismissed, setDismissed] = useState(false)
	const menu = useRef<HTMLDivElement>(null)

	useEditorKeys(
		(event) => {
			switch (event.key) {
				case 'Escape':
					setDismissed(true)
					return true
				case 'ArrowDown':
					if (selected >= apps.length - 1) return false
					setSelected(selected + 1)
					return true
				case 'ArrowUp':
					if (selected <= 0) return false
					setSelected(selected - 1)
					return true
				case 'Enter': {
					const link = menu.current?.querySelector<HTMLAnchorElement>('a[href]')
					if (!link) return false
					link.click()
					return true
				}
				default:
					return false
			}
		},
		!dismissed && apps.length > 0,
	)

	if (dismissed || apps.length === 0) return null

	return (
		<div ref={menu}>
			<ProjectsMenu
				className={className}
				onSelect={setSelected}
				selected={selected}
			/>
		</div>
	)
}
