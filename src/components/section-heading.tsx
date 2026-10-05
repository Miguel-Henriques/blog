import type { ReactNode } from 'react'

interface SectionHeadingProps {
	description?: string
	eyebrow: string
	title: ReactNode
}

export function SectionHeading({
	description,
	eyebrow,
	title,
}: SectionHeadingProps) {
	return (
		<div className="max-w-2xl">
			<p className="mb-3 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
				<span aria-hidden="true">{'// '}</span>
				{eyebrow}
			</p>
			<h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
				{title}
			</h2>
			{description ? (
				<p className="mt-4 leading-7 text-muted-foreground">{description}</p>
			) : null}
		</div>
	)
}
