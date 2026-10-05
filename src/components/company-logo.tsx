import { Building2 } from 'lucide-react'
import type { ReactNode } from 'react'

type CompanyLogoDefinition =
	| {
			alt: string
			srcLight: string
			srcDark: string
			fallback: ReactNode
			fallbackClassName: string
	  }
	| {
			alt: string
			src: string
			fallback: ReactNode
			fallbackClassName: string
	  }
	| {
			alt: string
			fallback: ReactNode
			fallbackClassName: string
	  }

const logoImageClassName = 'max-h-10 max-w-12 object-contain'

const companyLogoById = {
	contextual: {
		alt: 'Contextual',
		src: '/logos/contextual.png',
		fallback: <Building2 aria-hidden="true" className="size-6" />,
		fallbackClassName:
			'flex size-14 items-center justify-center text-muted-foreground',
	},
	aws: {
		alt: 'Amazon Web Services',
		srcLight: '/logos/aws-light.svg',
		srcDark: '/logos/aws-dark.svg',
		fallback: 'aws',
		fallbackClassName:
			'flex size-14 items-center justify-center text-lg font-bold tracking-tight text-[#232f3e] lowercase dark:text-white',
	},
	deloitte: {
		alt: 'Deloitte',
		srcLight: '/logos/deloitte-light.svg',
		srcDark: '/logos/deloitte-dark.svg',
		fallback: (
			<>
				Deloitte<span className="text-[#86bc25]">.</span>
			</>
		),
		fallbackClassName:
			'flex size-14 items-center justify-center text-[0.68rem] font-bold tracking-tight text-black dark:text-white',
	},
	neotalent: {
		alt: 'Neotalent',
		src: '/logos/neotalent.png',
		fallback: (
			<>
				<span>neo</span>
				<span>talent</span>
			</>
		),
		fallbackClassName:
			'flex size-14 flex-col items-center justify-center text-[0.65rem] leading-none font-bold tracking-tight text-[#5750a6] dark:text-[#a9a4ef]',
	},
} as const satisfies Record<string, CompanyLogoDefinition>

export type CompanyLogoId = keyof typeof companyLogoById

interface CompanyLogoProps {
	logo: string
}

/**
 * Renders a company mark from a registered image, a registered typographic
 * fallback, or a generic icon when the logo id is unknown.
 */
export function CompanyLogo({ logo }: CompanyLogoProps) {
	const definition: CompanyLogoDefinition | undefined =
		companyLogoById[logo as CompanyLogoId]

	if (!definition) {
		return (
			<span
				aria-label="Company"
				className="flex size-14 items-center justify-center text-muted-foreground"
				role="img"
			>
				<Building2 aria-hidden="true" className="size-6" />
			</span>
		)
	}

	if ('srcLight' in definition && 'srcDark' in definition) {
		return (
			<span
				aria-label={definition.alt}
				className="flex size-14 items-center justify-center"
				role="img"
			>
				<img
					alt=""
					className={`${logoImageClassName} ${logo === 'aws' ? 'company-logo-aws' : ''} dark:hidden`}
					loading="lazy"
					src={definition.srcLight}
				/>
				<img
					alt=""
					className={`${logoImageClassName} ${logo === 'aws' ? 'company-logo-aws' : ''} hidden dark:block`}
					loading="lazy"
					src={definition.srcDark}
				/>
			</span>
		)
	}

	if ('src' in definition && definition.src) {
		return (
			<span
				aria-label={definition.alt}
				className="flex size-14 items-center justify-center"
				role="img"
			>
				<img
					alt=""
					className={logoImageClassName}
					loading="lazy"
					src={definition.src}
				/>
			</span>
		)
	}

	return (
		<span
			aria-label={definition.alt}
			className={definition.fallbackClassName}
			role="img"
		>
			{definition.fallback}
		</span>
	)
}
