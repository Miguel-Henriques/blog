import { CredlyBadge } from '@/components/credly-badge'
import { SectionHeading } from '@/components/section-heading'
import { SpeakingAccordion } from '@/components/speaking-accordion'
import { profile } from '@/content/profile'

// Kept available for restoring speaking, certifications, education, and languages.
export function BackgroundSection() {
	return (
		<section className="mx-auto max-w-6xl px-5 py-24 sm:px-8" id="speaking">
			<SectionHeading
				description="Sessions and workshops centered on software engineering and cloud computing."
				eyebrow="Public speaking"
				title="Sharing what I learn."
			/>
			<div className="mt-14">
				<SpeakingAccordion events={profile.speaking} />
			</div>
			<div className="mt-20 grid gap-14 border-t pt-16 md:grid-cols-3">
				<div>
					<h2 className="font-serif text-3xl">Certifications</h2>

					<div className="mt-7 flex flex-wrap gap-[2px]">
						{profile.certifications.map((certification) => {
							if (!('badgeId' in certification) || !certification.badgeId) {
								return null
							}

							return (
								<CredlyBadge
									badgeId={certification.badgeId}
									key={certification.badgeId}
									name={certification.name}
								/>
							)
						})}
					</div>
				</div>
				<div>
					<h2 className="font-serif text-3xl">Education</h2>
					<p className="mt-7 font-semibold">{profile.education.degree}</p>
					<p className="mt-2 text-muted-foreground">
						{profile.education.institution}
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{profile.education.period} · {profile.education.location}
					</p>
				</div>
				<div>
					<h2 className="font-serif text-3xl">Languages</h2>
					<p className="mt-7 text-muted-foreground">
						{profile.languages.join(' · ')}
					</p>
				</div>
			</div>
		</section>
	)
}
