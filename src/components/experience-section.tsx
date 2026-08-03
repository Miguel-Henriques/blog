import { Building2 } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { Separator } from '@/components/ui/separator'
import { profile } from '@/content/profile'

type CompanyLogo = (typeof profile.experience)[number]['logos'][number]

interface CompanyLogoProps {
	logo: CompanyLogo
}

function CompanyLogoMark({ logo }: CompanyLogoProps) {
	if (logo === 'stealth') {
		return (
			<span
				aria-label="Stealth company"
				className="flex size-14 items-center justify-center text-muted-foreground"
				role="img"
			>
				<Building2 aria-hidden="true" className="size-6" />
			</span>
		)
	}

	if (logo === 'aws') {
		return (
			<span
				aria-label="Amazon Web Services"
				className="flex size-14 items-center justify-center text-lg font-bold tracking-tight text-[#232f3e] lowercase dark:text-white"
				role="img"
			>
				aws
			</span>
		)
	}

	if (logo === 'deloitte') {
		return (
			<span
				aria-label="Deloitte"
				className="flex size-14 items-center justify-center text-[0.68rem] font-bold tracking-tight text-black dark:text-white"
				role="img"
			>
				Deloitte<span className="text-[#86bc25]">.</span>
			</span>
		)
	}

	return (
		<span
			aria-label="Neotalent"
			className="flex size-14 flex-col items-center justify-center text-[0.65rem] leading-none font-bold tracking-tight text-[#5750a6] dark:text-[#a9a4ef]"
			role="img"
		>
			<span>neo</span>
			<span>talent</span>
		</span>
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
				<div className="mt-16">
					{profile.experience.map((position, index) => (
						<article
							className="grid gap-6 py-10 md:grid-cols-[15rem_1fr]"
							key={`${position.company}-${position.period}`}
						>
							<div>
								<p className="text-sm font-semibold">{position.period}</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{position.location}
								</p>
							</div>
							<div>
								<div className="flex items-start gap-4">
									<div className="flex shrink-0 gap-2">
										{position.logos.map((logo) => (
											<CompanyLogoMark key={logo} logo={logo} />
										))}
									</div>
									<div className="pt-0.5">
										<h3 className="font-serif text-2xl">{position.role}</h3>
										<p className="mt-1 font-medium text-primary">
											{position.company}
										</p>
									</div>
								</div>
								{'highlights' in position ? (
									<ul className="mt-5 space-y-3 text-muted-foreground">
										{position.highlights.map((highlight) => (
											<li className="flex gap-3 leading-7" key={highlight}>
												<span
													aria-hidden="true"
													className="mt-3 size-1 shrink-0 rounded-full bg-primary"
												/>
												{highlight}
											</li>
										))}
									</ul>
								) : null}
								{'projects' in position ? (
									<div className="mt-7 space-y-7">
										{position.projects.map((project) => (
											<div key={project.name}>
												<h4 className="font-semibold">{project.name}</h4>
												<ul className="mt-2 space-y-2 text-muted-foreground">
													{project.highlights.map((highlight) => (
														<li className="leading-7" key={highlight}>
															{highlight}
														</li>
													))}
												</ul>
											</div>
										))}
									</div>
								) : null}
							</div>
							{index < profile.experience.length - 1 ? (
								<Separator className="md:col-span-2" />
							) : null}
						</article>
					))}
				</div>
			</div>
		</section>
	)
}
