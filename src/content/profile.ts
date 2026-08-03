export const profile = {
	name: 'Miguel Pestana Henriques',
	role: 'Software Engineer',
	location: 'Lisbon, Portugal',
	email: 'miguel.p.henriques.96@gmail.com',
	linkedin: 'https://www.linkedin.com/in/miguelhenriques96',
	summary:
		'Software engineer with 7 years designing and building full-stack ' +
		'applications across cloud platforms and, most recently, AI-native ' +
		'products. Founding engineer experience shipping agentic workflows ' +
		'end-to-end, plus 5+ years of consulting experience, including at ' +
		'AWS Professional Services, delivering production-ready platforms ' +
		'for enterprise customers.',
	experience: [
		{
			role: 'Founding Engineer',
			company: 'Contextual',
			logos: ['stealth'],
			period: 'January 2026 – June 2026',
			location: 'Badajoz, Spain · Remote',
			highlights: [
				'One of three founding team members building an AI-native ' +
				'design experience that enables non-technical users to ' +
				'iterate directly on live web applications.',
				'Jointly owned the product’s architectural direction with the ' +
				'CTO and built core features, including the agentic workflow ' +
				'for generating embeddable website components.',
			],
		},
		{
			role: 'Cloud Application Architect',
			company: 'Amazon Web Services · Professional Services',
			logos: ['aws'],
			period: 'January 2023 – January 2026',
			location: 'Munich, Germany',
			projects: [
				{
					name: 'Fusion Platform · TP ICAP',
					highlights: [
						'Built the next generation of TP ICAP’s trading ' +
						'platform as part of the core engineering team.',
						'Co-led a compatibility adapter that cut legacy ' +
						'application integration from months to weeks and ' +
						'authored an organisation-wide permissions model.',
					],
				},
				{
					name: 'Direct Sales Model · BMW Group',
					highlights: [
						'Helped build the platform supporting BMW Group’s ' +
						'transition to a direct-sales agency model.',
						'Led the architecture and implementation of a reusable ' +
						'authorisation service adopted by three other internal ' +
						'projects.',
					],
				},
				{
					name: 'Cloud Efficiency Analytics · BMW Group',
					highlights: [
						'Led UI engineering and UX for a FinOps platform from ' +
						'prototype to general availability for 2,000+ users.',
						'Created reusable Amazon QuickSight embedding blueprints ' +
						'adopted by six other customer teams.',
					],
				},
			],
		},
		{
			role: 'Tech Lead',
			company: 'Deloitte',
			logos: ['deloitte'],
			period: 'February 2022 – December 2022',
			location: 'Lisbon, Portugal',
			highlights: [
				'Led six engineers building a cross-platform BMW Group ' +
				'analytics application that turns vehicle sales data into ' +
				'purpose-built views for C-level executives.',
				'Worked with stakeholders, product owners, and designers to ' +
				'shape product decisions while mentoring engineers.',
			],
		},
		{
			role: 'Earlier experience',
			company: 'Neotalent and Deloitte',
			logos: ['neotalent', 'deloitte'],
			period: '2019 – 2022',
			location: 'Portugal',
			highlights: [
				'Built and maintained infrastructure for Deltatre-hosted OTT ' +
				'applications as a DevOps Engineer at Neotalent.',
				'Built a production-plant automated-driving orchestrator for ' +
				'BMW Group as a Technology Consultant at Deloitte.',
			],
		},
	],
	certifications: [
		'AWS Certified Solutions Architect – Associate',
		'AWS Certified Developer – Associate',
		'Professional Scrum Master I · Scrum.org',
	],
	speaking: [
		{
			event: 'AWS Cloud Day',
			location: 'Zurich',
			year: '2023',
			summary:
				'Explored how modern applications move from design through ' +
				'security and operations, highlighting emerging patterns that ' +
				'teams often overlook across the development lifecycle.',
			presentedWith: 'Emanuel Scirlet',
			images: [
				{
					alt: 'Miguel Henriques and Emanuel Scirlet at AWS Cloud Day Zurich',
					src: '/speaking/aws-cloud-day-zurich-2023_2.jpeg',
				},
				{
					alt: 'AWS Cloud Day Zurich speakers and event team',
					src: '/speaking/aws-cloud-day-zurich-2023_1.jpg',
				},
			],
		},
		{
			event: 'AWS Tech Summit',
			location: 'Virtual',
			year: '2023',
			summary:
				'Presented a technical session on practical patterns for building ' +
				'modern cloud applications on AWS.',
			presentedWith: 'Co-speaker details to be added',
			images: [
				{
					alt: 'AWS logo for the virtual AWS Tech Summit',
					isLogo: true,
					src: '/speaking/aws-tech-summit-2023.svg',
				},
			],
		},
		{
			event: 'Amazon DevCon',
			location: 'Seattle',
			year: '2024',
			summary:
				'Introduced Zero Trust architecture principles and showed how ' +
				'Amazon Verified Permissions and AWS Verified Access provide ' +
				'identity-aware controls for modern applications.',
			presentedWith: 'Emanuel Scirlet',
			images: [
				{
					alt: 'Miguel Henriques and Emanuel Scirlet presenting at Amazon DevCon',
					src: '/speaking/amazon-devcon-seattle-2024_2.jpeg',
				},
				{
					alt: 'Miguel Henriques presenting at Amazon DevCon',
					src: '/speaking/amazon-devcon-seattle-2024_1.jpeg',
				},
			],
		},
		{
			event: 'Node Congress',
			location: 'Virtual',
			year: '2024',
			summary:
				'Led a hands-on workshop demonstrating how GraphQL and JavaScript ' +
				'can be used to build modern, secure APIs and where the query ' +
				'language is the right fit.',
			presentedWith: 'Solo workshop',
			images: [
				{
					alt: 'Node Congress logo for the virtual workshop',
					isLogo: true,
					src: '/speaking/node-congress-virtual-2024.svg',
				},
			],
		},
		{
			event: 'Amazon WebDevCon',
			location: 'New York',
			year: '2024',
			summary:
				'Presented an engineering session focused on building modern web ' +
				'applications with AWS.',
			presentedWith: 'Co-speaker details to be added',
			images: [
				{
					alt: 'Miguel Henriques at Amazon WebDevCon in New York',
					src: '/speaking/web-dev-con-new-york-2024.jpeg',
				},
			],
		},
		{
			event: 'AWS Community Day',
			location: 'Lisbon',
			year: '2025',
			summary:
				'Shared a Zero-Trust-from-day-one approach for web applications, ' +
				'using practical security patterns tested with AWS customers.',
			presentedWith: 'Emanuel Scirlet',
			images: [
				{
					alt: 'Miguel Henriques presenting at AWS Community Day in Lisbon',
					src: '/speaking/aws-community-day-portugal-2025.jpeg',
				},
			],
		},
	],
	education: {
		degree: 'BSc Computer Science and Business Management',
		institution: 'Instituto Universitário de Lisboa · ISCTE',
		period: '2015 – 2019',
		location: 'Lisbon, Portugal',
	},
	languages: [
		'Portuguese · Native',
		'English · Professional working proficiency',
	],
} as const
