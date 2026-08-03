import { SectionHeading } from '@/components/section-heading'
import { Badge } from '@/components/ui/badge'
import { profile } from '@/content/profile'

export function CapabilitiesSection() {
	return (
		<section className="mx-auto max-w-6xl px-5 py-24 sm:px-8" id="skills">
			<SectionHeading
				eyebrow="Capabilities"
				title="A broad toolkit, applied with intent."
			/>
			<div className="mt-14 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
				{profile.skills.map((skill) => (
					<article className="bg-background p-6" key={skill.label}>
						<h3 className="font-serif text-xl">{skill.label}</h3>
						<ul className="mt-5 flex flex-wrap gap-2">
							{skill.items.map((item) => (
								<li key={item}>
									<Badge variant="secondary">{item}</Badge>
								</li>
							))}
						</ul>
					</article>
				))}
			</div>
		</section>
	)
}
