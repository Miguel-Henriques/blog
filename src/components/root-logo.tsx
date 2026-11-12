/**
 * The workspace root, "MH", set in Instrument Serif italic. The letters
 * between the initials unfold to "Miguel Henriques" on hover or keyboard
 * focus of the breadcrumb button (see .root-logo in index.css).
 */
export function RootLogo() {
	return (
		<span aria-hidden="true" className="root-logo">
			<span>M</span>
			<span className="root-logo-fold">iguel </span>
			<span>H</span>
			<span className="root-logo-fold">enriques</span>
		</span>
	)
}
