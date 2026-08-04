import {
	ExperienceDetails,
	ExperienceIdentity,
	ExperienceMeta,
} from '@/components/experience-content'
import { SectionHeading } from '@/components/section-heading'
import { profile } from '@/content/profile'

function EditorialRail() {
	return (
		<div className="group mt-12">
			{profile.experience.map((position, index) => (
				<article
					className="grid gap-x-5 transition-[filter,opacity] duration-300 group-has-[article:focus-within]:opacity-40 group-has-[article:focus-within]:grayscale group-has-[article:hover]:opacity-40 group-has-[article:hover]:grayscale hover:!opacity-100 hover:!grayscale-0 focus-within:!opacity-100 focus-within:!grayscale-0 md:grid-cols-[8.5rem_1.5rem_1fr]"
					key={`${position.company}-${position.period}`}
				>
					<ExperienceMeta className="pb-12 md:text-right" position={position} />
					<div
						aria-hidden="true"
						className="relative hidden justify-center md:flex"
					>
						<span className="relative z-10 mt-1.5 size-3 rounded-full border-4 border-card bg-primary box-content" />
						{index < profile.experience.length - 1 ? (
							<span className="absolute top-5 bottom-0 w-px bg-border" />
						) : null}
					</div>
					<div className="pb-12 md:pl-2">
						<ExperienceIdentity position={position} />
						<ExperienceDetails className="mt-6" position={position} />
					</div>
				</article>
			))}
		</div>
	)
}

export function ExperienceSection() {
	return (
		<section className="border-y bg-card" id="experience">
			<div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
				<SectionHeading
					eyebrow="Experience"
					title="From product foundations to enterprise platforms."
				/>
				<EditorialRail />
			</div>
		</section>
	)
}
