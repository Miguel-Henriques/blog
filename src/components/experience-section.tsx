import { useId } from 'react'
import { CompanyLogo } from '@/components/company-logo'
import {
	ExperienceDetails,
	ExperienceMeta,
	type ExperiencePosition,
} from '@/components/experience-content'
import { SectionHeading } from '@/components/section-heading'
import { profile } from '@/content/profile'

interface ExperienceItemProps {
	position: ExperiencePosition
	isLast: boolean
}

function ExperienceItem({ position, isLast }: ExperienceItemProps) {
	const titleId = useId()

	return (
		<article
			className="experience-entry scroll-mt-24 grid grid-cols-[1rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0 md:grid-cols-[12rem_1.5rem_minmax(0,1fr)] md:gap-x-5"
			aria-labelledby={titleId}
		>
			<ExperienceMeta
				className="col-start-2 row-start-1 pb-3 md:col-start-1 md:pb-0 md:pt-2 md:text-right"
				position={position}
			/>
			<div
				aria-hidden="true"
				className="relative col-start-1 row-span-2 row-start-1 flex justify-center md:col-start-2 md:row-span-1"
			>
				<span className="relative z-10 mt-2.5 size-3 rounded-full border-4 border-card bg-primary box-content" />
				{!isLast ? (
					<span className="absolute top-6 -bottom-10 w-px bg-border" />
				) : null}
			</div>
			<div className="experience-item col-start-2 row-start-2 md:col-start-3 md:row-start-1">
				<div className="experience-logo company-logo-group flex shrink-0 items-center p-2">
					{position.logos.map((logo) => (
						<CompanyLogo key={logo} logo={logo} />
					))}
				</div>
				<div className="min-w-0 py-2">
					<h3 className="font-serif text-xl" id={titleId}>
						{position.role}
					</h3>
					<p className="mt-1 font-medium text-primary">{position.company}</p>
					<ExperienceDetails className="mt-6" position={position} />
				</div>
			</div>
		</article>
	)
}

export function ExperienceSection() {
	return (
		<section className="scroll-mt-16 bg-card" id="experience">
			<div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
				<SectionHeading
					eyebrow="Experience"
					title="From product foundations to enterprise platforms."
				/>
				<div className="mt-12">
					{profile.experience.map((position, index) => (
						<ExperienceItem
							isLast={index === profile.experience.length - 1}
							key={`${position.company}-${position.startDate}`}
							position={position}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
