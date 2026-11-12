export const getCvHref = () => `/${globalThis.location.hostname}-cv.pdf`

export const downloadCv = () => {
	const link = document.createElement('a')
	link.href = getCvHref()
	link.download = ''
	link.click()
}
