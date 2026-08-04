interface CertificationDefinition {
	title: string
	image?: string
}

const certificationByName = {
	'aws-sa-associate': {
		title: 'AWS Certified Solutions Architect – Associate',
		image: '/certs/aws-sa-associate.png',
	},
	'aws-dev-associate': {
		title: 'AWS Certified Developer – Associate',
		image: '/certs/aws-dev-associate.png',
	},
	'psm-i': {
		title: 'Professional Scrum Master I · Scrum.org',
		image: '/certs/psm-i.png',
	},
} as const satisfies Record<string, CertificationDefinition>

export type CertificationName = keyof typeof certificationByName

interface CredlyBadgeProps {
	badgeId: string
	name: string
}

/**
 * Returns the display title for a certification slug, or the slug itself when
 * unknown.
 */
export const getCertificationTitle = (name: string): string => {
	const certification = certificationByName[name as CertificationName]

	if (!certification) {
		return name
	}

	return certification.title
}

/**
 * Renders a linked Credly badge image for a known certification slug.
 */
export function CredlyBadge({ badgeId, name }: CredlyBadgeProps) {
	const certification = certificationByName[name as CertificationName]

	if (!certification || !('image' in certification) || !certification.image) {
		return null
	}

	const { image, title } = certification

	return (
		<a
			aria-label={`View ${title} credential on Credly`}
			className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			href={`https://www.credly.com/badges/${badgeId}/public_url`}
			rel="noreferrer"
			target="_blank"
		>
			<img alt={`${title} badge`} loading="lazy" src={image} width={90} />
		</a>
	)
}
