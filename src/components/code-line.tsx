import { cn } from '@/lib/utils'

export function FileIcon({
	className,
	path,
}: {
	className?: string
	path?: string
}) {
	const extension = path?.slice(path.lastIndexOf('.') + 1)
	const icon =
		extension === 'pdf'
			? { className: 'text-syntax-keyword', label: 'PDF' }
			: extension === 'ts'
				? { className: 'text-primary', label: 'TS' }
				: { className: 'text-syntax-constant', label: '#' }

	return (
		<span
			aria-hidden="true"
			className={cn(
				'inline-block min-w-4 shrink-0 text-center font-mono text-[10px] leading-none font-bold',
				icon.className,
				className,
			)}
		>
			{icon.label}
		</span>
	)
}
