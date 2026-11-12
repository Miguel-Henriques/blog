import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const COLLAPSED = 'MH'
const EXPANDED = 'MIGUEL HENRIQUES'
/** Glyphs shown while a character is still "decoding". */
const GLYPHS = '01<>/{}[]#*+=_$%&01'
const FRAME_MS = 32

const randomGlyph = () =>
	GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? '0'

/**
 * Text that decodes into `target` whenever it changes: the box grows or
 * shrinks a character at a time while each position flickers through
 * code glyphs before locking onto its letter, left to right.
 */
function useDecode(target: string) {
	const isReducedMotion = useReducedMotion()
	const [text, setText] = useState(target)
	const [decoding, setDecoding] = useState(false)
	const shown = useRef(target)

	useEffect(() => {
		const from = shown.current
		if (from === target) return

		if (isReducedMotion) {
			shown.current = target
			setText(target)
			return
		}

		const growing = target.length > from.length
		let frame = 0
		setDecoding(true)

		const id = window.setInterval(() => {
			frame += 1
			const length = growing
				? Math.min(target.length, from.length + frame * 2)
				: Math.max(target.length, from.length - frame * 2)
			let next = ''
			let done = length === target.length

			for (let index = 0; index < length; index++) {
				const letter = target[index]
				const lockAt = (growing ? 2 : 4) + index * (growing ? 0.9 : 2)
				if (letter !== undefined && (letter === ' ' || frame >= lockAt)) {
					next += letter
				} else {
					next += randomGlyph()
					done = false
				}
			}

			shown.current = next
			setText(next)

			if (done) {
				window.clearInterval(id)
				setDecoding(false)
			}
		}, FRAME_MS)

		return () => window.clearInterval(id)
	}, [isReducedMotion, target])

	return { decoding, text }
}

/**
 * The logo: a machined plate with chamfered corners and the letters cut out
 * of it, set in Chakra Petch capitals.
 */
export function LogoMark({
	children = COLLAPSED,
	decoding = false,
}: {
	children?: string
	decoding?: boolean
}) {
	return (
		<span
			aria-hidden="true"
			className="logo-plate"
			data-decoding={decoding || undefined}
		>
			{children}
		</span>
	)
}

/*
 * The cube logo is the logo plate extruded: front and back are the plate's
 * outline with its top-left and bottom-right corners cut back by `c`, the two
 * cut corners run back through the depth `d` as narrow bevels, and the other
 * faces are shortened to meet them, so the shape stays closed at any `c` and
 * `d`. At rest (`d` 0, `c` CUT, facing you) it is exactly the flat plate.
 * Lengths are px at the base size; the whole mark scales up on larger
 * screens.
 */
const PLATE = { h: 40, w: 64 }
const DEPTH = 64
const CUT = 10
const TILT = -14
const CUBE_FACES = [
	'front',
	'back',
	'right',
	'left',
	'top',
	'bottom',
	'bevel-tl',
	'bevel-br',
] as const

interface CubePose {
	/** How far the plate's corners are cut back. */
	c: number
	/** Depth of the extrusion. */
	d: number
	/** Camera tilt, in degrees (negative looks down). */
	tilt: number
	/** Turn about the view's vertical axis, in degrees. */
	yaw: number
}

const REST: CubePose = { c: CUT, d: 0, tilt: 0, yaw: 0 }

/** The plate outline with corners cut back by `c`; the back face is mirrored. */
const platePoints = (c: number, mirrored = false) => {
	const { h, w } = PLATE
	return mirrored
		? `0,0 ${w - c},0 ${w},${c} ${w},${h} ${c},${h} 0,${h - c}`
		: `0,${c} ${c},0 ${w},0 ${w},${h - c} ${w - c},${h} 0,${h}`
}

const easeInOutCubic = (t: number) =>
	t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

/**
 * The collapsed logo inverted (an outlined plate with solid "MH") on the
 * screen with no file open. On hover the plate extrudes into a box as the
 * camera tips to a three-quarter view, the box spins half a turn, then it
 * flattens back into the plate. One timeline drives depth, tilt, turn and
 * corner cut together, so the bevels square off as the depth grows and
 * return as it flattens. "MH" stays fixed in front throughout. Never plays
 * when reduced motion is on.
 */
export function LogoCube({ className }: { className?: string }) {
	const isReducedMotion = useReducedMotion()
	const ref = useRef<HTMLDivElement>(null)
	const playing = useRef(false)
	const frame = useRef(0)

	useEffect(() => () => cancelAnimationFrame(frame.current), [])

	const pose = ({ c, d, tilt, yaw }: CubePose) => {
		const element = ref.current
		if (!element) return
		element.style.setProperty('--c', `${c}px`)
		element.style.setProperty('--d', `${d}px`)
		element.style.setProperty('--tilt', `${tilt}deg`)
		element.style.setProperty('--yaw', `${yaw}deg`)
		element
			.querySelector('.logo-cube-front polygon')
			?.setAttribute('points', platePoints(c))
		element
			.querySelector('.logo-cube-back polygon')
			?.setAttribute('points', platePoints(c, true))
	}

	/** Runs `step(eased progress)` every animation frame for `ms`. */
	const animate = (ms: number, step: (progress: number) => void) =>
		new Promise<void>((resolve) => {
			const start = performance.now()
			const tick = (now: number) => {
				const t = Math.min(1, (now - start) / ms)
				step(easeInOutCubic(t))
				if (t < 1) frame.current = requestAnimationFrame(tick)
				else resolve()
			}
			frame.current = requestAnimationFrame(tick)
		})

	const play = async () => {
		if (playing.current || isReducedMotion) return
		playing.current = true
		await animate(500, (p) =>
			pose({ c: CUT * (1 - p), d: DEPTH * p, tilt: TILT * p, yaw: 45 * p }),
		)
		await animate(800, (p) =>
			pose({ c: 0, d: DEPTH, tilt: TILT, yaw: 45 + 180 * p }),
		)
		await animate(500, (p) =>
			pose({
				c: CUT * p,
				d: DEPTH * (1 - p),
				tilt: TILT * (1 - p),
				yaw: 225 + 135 * p,
			}),
		)
		pose(REST)
		playing.current = false
	}

	return (
		<div
			aria-hidden="true"
			className={cn('logo-cube', className)}
			onPointerEnter={play}
			ref={ref}
			style={
				{
					'--c': `${REST.c}px`,
					'--d': `${REST.d}px`,
					'--tilt': `${REST.tilt}deg`,
					'--yaw': `${REST.yaw}deg`,
				} as CSSProperties
			}
		>
			<div className="logo-cube-box">
				{CUBE_FACES.map((side) => (
					<svg
						aria-hidden="true"
						className={`logo-cube-face logo-cube-${side}`}
						key={side}
						{...(side === 'front' || side === 'back'
							? { viewBox: `0 0 ${PLATE.w} ${PLATE.h}` }
							: {})}
					>
						{side === 'front' || side === 'back' ? (
							<polygon points={platePoints(CUT, side === 'back')} />
						) : (
							<rect height="100%" width="100%" />
						)}
					</svg>
				))}
			</div>
			<svg aria-hidden="true" className="logo-cube-letters" viewBox="0 0 72 40">
				<text textAnchor="middle" x="36.9" y="32">
					{COLLAPSED}
				</text>
			</svg>
		</div>
	)
}

/**
 * The workspace root in the breadcrumbs. Collapsed it is the "MH" plate; on
 * hover or keyboard focus of its button the plate stretches and decodes into
 * "MIGUEL HENRIQUES", and back again on leave.
 */
export function RootLogo() {
	const ref = useRef<HTMLSpanElement>(null)
	const [expanded, setExpanded] = useState(false)
	const { decoding, text } = useDecode(expanded ? EXPANDED : COLLAPSED)

	useEffect(() => {
		const trigger = ref.current?.closest('button')
		if (!trigger) return

		const expand = () => setExpanded(true)
		const collapse = () => {
			if (!trigger.matches(':hover, :focus-visible')) setExpanded(false)
		}
		const focus = () => {
			if (trigger.matches(':focus-visible')) expand()
		}

		trigger.addEventListener('pointerenter', expand)
		trigger.addEventListener('pointerleave', collapse)
		trigger.addEventListener('focus', focus)
		trigger.addEventListener('blur', collapse)
		return () => {
			trigger.removeEventListener('pointerenter', expand)
			trigger.removeEventListener('pointerleave', collapse)
			trigger.removeEventListener('focus', focus)
			trigger.removeEventListener('blur', collapse)
		}
	}, [])

	return (
		<span className="inline-flex" ref={ref}>
			<LogoMark decoding={decoding}>{text}</LogoMark>
		</span>
	)
}
