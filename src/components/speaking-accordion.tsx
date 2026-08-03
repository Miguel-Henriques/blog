import { ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import type { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

type SpeakingEvent = (typeof profile.speaking)[number]
type SpeakingImage = SpeakingEvent['images'][number]

interface SpeakingAccordionProps {
	events: typeof profile.speaking
}

interface SpeakingCarouselProps {
	images: readonly SpeakingImage[]
}

interface SpeakingAccordionItemProps {
	event: SpeakingEvent
	index: number
}

function SpeakingCarousel({ images }: SpeakingCarouselProps) {
	const [activeIndex, setActiveIndex] = useState(0)
	const carouselRef = useRef<HTMLDivElement>(null)
	const hasMultipleImages = images.length > 1

	const handleSelectImage = useCallback((nextIndex: number) => {
		setActiveIndex(nextIndex)
		carouselRef.current?.scrollTo({
			behavior: 'smooth',
			left: carouselRef.current.clientWidth * nextIndex,
		})
	}, [])

	const handlePrevious = useCallback(() => {
		const previousIndex =
			activeIndex === 0 ? images.length - 1 : activeIndex - 1

		handleSelectImage(previousIndex)
	}, [activeIndex, handleSelectImage, images.length])

	const handleNext = useCallback(() => {
		const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1

		handleSelectImage(nextIndex)
	}, [activeIndex, handleSelectImage, images.length])

	return (
		<section
			aria-label="Event images"
			aria-roledescription="carousel"
			className="relative min-w-0 overflow-hidden bg-muted"
		>
			<div className="flex overflow-hidden" ref={carouselRef}>
				{images.map((image, index) => {
					const isLogo = 'isLogo' in image && image.isLogo

					return (
						<figure
							aria-hidden={index !== activeIndex}
							className={cn(
								'aspect-video w-full shrink-0 overflow-hidden',
								isLogo && 'bg-[#111827] p-12 sm:p-16',
							)}
							key={image.src}
						>
							<img
								alt={image.alt}
								className={cn(
									'h-full w-full',
									isLogo ? 'object-contain' : 'object-cover',
								)}
								decoding="async"
								loading="lazy"
								src={image.src}
							/>
						</figure>
					)
				})}
			</div>
			{hasMultipleImages ? (
				<>
					<div
						aria-live="polite"
						className="absolute right-4 bottom-4 rounded-full bg-background/90 px-3 py-1 text-xs"
					>
						{activeIndex + 1} / {images.length}
					</div>
					<div className="absolute bottom-4 left-4 flex gap-2">
						<Button
							aria-label="Show previous event image"
							onClick={handlePrevious}
							size="icon-sm"
							type="button"
							variant="secondary"
						>
							<ChevronLeft aria-hidden="true" />
						</Button>
						<Button
							aria-label="Show next event image"
							onClick={handleNext}
							size="icon-sm"
							type="button"
							variant="secondary"
						>
							<ChevronRight aria-hidden="true" />
						</Button>
					</div>
				</>
			) : null}
		</section>
	)
}

function SpeakingAccordionItem({ event, index }: SpeakingAccordionItemProps) {
	const value = `${event.event}-${event.year}`

	return (
		<AccordionItem value={value}>
			<AccordionTrigger className="py-6 hover:no-underline">
				<span className="grid flex-1 items-baseline gap-2 pr-3 sm:grid-cols-[3rem_1fr_auto] sm:gap-5">
					<span className="text-xs tracking-[0.16em] text-primary">
						{String(index + 1).padStart(2, '0')}
					</span>
					<span className="font-serif text-xl">{event.event}</span>
					<span className="text-sm font-normal text-muted-foreground">
						{event.location} · {event.year}
					</span>
				</span>
			</AccordionTrigger>
			<AccordionContent className="pb-8">
				<article className="grid gap-8 lg:grid-cols-2 lg:gap-12">
					<SpeakingCarousel images={event.images} />
					<div className="flex flex-col justify-center">
						<h3 className="font-serif text-3xl">{event.event}</h3>
						<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
							<span className="flex items-center gap-2">
								<MapPin aria-hidden="true" className="size-4" />
								{event.location} · {event.year}
							</span>
							<span className="flex items-center gap-2">
								<Users aria-hidden="true" className="size-4" />
								{event.presentedWith}
							</span>
						</div>
						<p className="mt-6 leading-7 text-muted-foreground">
							{event.summary}
						</p>
					</div>
				</article>
			</AccordionContent>
		</AccordionItem>
	)
}

export function SpeakingAccordion({ events }: SpeakingAccordionProps) {
	const defaultEvent = events[0]
	const defaultValue = defaultEvent
		? `${defaultEvent.event}-${defaultEvent.year}`
		: ''

	if (!defaultEvent) {
		return null
	}

	return (
		<Accordion
			className="border-y"
			collapsible
			defaultValue={defaultValue}
			type="single"
		>
			{events.map((event, index) => (
				<SpeakingAccordionItem
					event={event}
					index={index}
					key={`${event.event}-${event.year}`}
				/>
			))}
		</Accordion>
	)
}
