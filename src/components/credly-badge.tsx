const badgeImageByName = {
	'AWS Certified Solutions Architect – Associate':
		'/certs/aws-sa-associate.png',
} as const

type BadgeName = keyof typeof badgeImageByName

interface CredlyBadgeProps {
	badgeId: string
	name: BadgeName
}

export function CredlyBadge({ badgeId, name }: CredlyBadgeProps) {
	return (
		<a
			aria-label={`View ${name} credential on Credly`}
			className="mt-7 inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			href={`https://www.credly.com/badges/${badgeId}/public_url`}
			rel="noreferrer"
			target="_blank"
		>
			<img
				alt={`${name} badge`}
				loading="lazy"
				src={badgeImageByName[name]}
				width={100}
			/>
		</a>
	)
}
