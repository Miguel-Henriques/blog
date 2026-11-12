const isApplePlatform = () =>
	typeof navigator !== 'undefined' &&
	/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)

/** Formats a shortcut for the visitor's platform, e.g. ⇧⌘P or Ctrl+Shift+P. */
export const formatShortcut = (key: string, { shift = false } = {}) =>
	isApplePlatform()
		? `${shift ? '⇧' : ''}⌘${key}`
		: `Ctrl+${shift ? 'Shift+' : ''}${key}`
