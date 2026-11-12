import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import type { ReactNode } from 'react'
import { FileIcon } from '@/components/code-line'
import { RootLogo } from '@/components/root-logo'
import { cn } from '@/lib/utils'
import { baseName, filesInFolder, folderOf } from '@/workspace/files'
import { useWorkspace } from '@/workspace/workspace'

const crumbClassName =
	'inline-flex h-7 min-w-0 shrink-0 items-center gap-1.5 rounded-md px-1.5 whitespace-nowrap transition-colors hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground'

const itemClassName =
	'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground'

function Separator({ className }: { className?: string }) {
	return (
		<ChevronRight
			aria-hidden="true"
			className={cn('size-3.5 shrink-0 text-line-number', className)}
		/>
	)
}

function CrumbMenu({
	children,
	className,
	label,
	triggerLabel,
}: {
	children: ReactNode
	className?: string
	label: ReactNode
	triggerLabel: string
}) {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				aria-label={triggerLabel}
				className={cn(crumbClassName, className)}
			>
				{label}
				<ChevronDown
					aria-hidden="true"
					className="size-3 shrink-0 opacity-60"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="start"
					className="z-50 max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height))] min-w-56 overflow-y-auto rounded-md border bg-card p-1 font-ui text-[13px] text-card-foreground shadow-lg"
					sideOffset={6}
				>
					{children}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

function FileMenuItems({ folder }: { folder: string }) {
	const { open, path } = useWorkspace()

	return filesInFolder(folder).map((file) => (
		<DropdownMenu.Item
			className={itemClassName}
			key={file.path}
			onSelect={() => open(file.path)}
		>
			<FileIcon path={file.path} />
			<span className="truncate">{baseName(file.path)}</span>
			{file.path === path ? (
				<Check aria-label="Open" className="ml-auto size-3.5 shrink-0" />
			) : null}
		</DropdownMenu.Item>
	))
}

/**
 * Editor breadcrumbs: workspace › folder › file. The root closes every file;
 * the others open a menu of sibling files, like VS Code.
 */
export function Breadcrumbs() {
	const { open, path } = useWorkspace()
	const folder = path ? folderOf(path) : ''

	return (
		<nav
			aria-label="Breadcrumb"
			className="flex min-w-0 items-center gap-0.5 font-ui text-[13px] text-muted-foreground"
		>
			<button
				aria-label="Miguel Henriques, close all files"
				className={cn(crumbClassName, 'group/logo text-foreground')}
				onClick={() => open(null)}
				title="Close all files"
				type="button"
			>
				<RootLogo />
			</button>
			{folder ? (
				<>
					<Separator className="max-sm:hidden" />
					<CrumbMenu
						className="max-sm:hidden"
						label={folder}
						triggerLabel={`${folder} folder`}
					>
						<FileMenuItems folder={folder} />
					</CrumbMenu>
				</>
			) : null}
			{path ? (
				<>
					<Separator />
					<CrumbMenu
						className="shrink text-foreground"
						label={
							<>
								<FileIcon path={path} />
								<span className="truncate">{baseName(path)}</span>
							</>
						}
						triggerLabel={`${baseName(path)}, switch file`}
					>
						<FileMenuItems folder={folder} />
					</CrumbMenu>
				</>
			) : null}
		</nav>
	)
}
