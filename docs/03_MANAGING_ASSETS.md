# Managing Assets

How to prepare and publish images and videos for the site without bloating the
bundle or degrading page performance.

## Contents

- [Principles](#principles)
- [Format rules](#format-rules)
- [Where assets live](#where-assets-live)
- [Convert images with sharp](#convert-images-with-sharp)
- [Prepare videos](#prepare-videos)
- [When to use GIF](#when-to-use-gif)
- [Add media to an app](#add-media-to-an-app)
- [Accessibility and privacy](#accessibility-and-privacy)
- [Size budget](#size-budget)

## Principles

The cheapest optimization is a smaller source file. Lazy loading and CDN
caching help, but they do not replace lean assets committed to the repo.

These rules apply to raster images only. SVG logos and icons are already
vector-based and should not be converted to AVIF.

## Format rules

Use these formats in order of preference:

- Raster images: AVIF.
- Transparency or pixel-perfect lossless detail: PNG.
- Screen recordings: muted MP4 using H.264.
- Optional video fallback or additional compression: WebM using VP9.
- Video preview frame: AVIF.
- Very short, low-motion animation only: GIF.

Never upload camera originals or raw screen recordings without re-encoding
them.

Cap general site photos such as speaking shots and certification badges at
1280 pixels wide. App card screenshots use a 1600 by 900 frame.

## Where assets live

| Asset type | Directory | Referenced from |
| --- | --- | --- |
| Speaking photos | `public/speaking/` | `content/profile.json` |
| Certification badges | `public/certs/` | `src/components/credly-badge.tsx` |
| Company logos | `public/logos/` | `content/profile.json` |
| App screenshots and demos | `public/media/apps/` | `content/apps.json` |

Deploy media with the rest of the static site via `make app-release` or
`make app-deploy`. Do not upload files directly to S3; synchronized
deployments can remove objects that are not in the build output.

## Convert images with sharp

The project already includes [`sharp`](https://sharp.pixelplumbing.com/) as a
dev dependency. Use the same script shape for every raster image and adjust
`resize`, output path, and quality per asset type.

```sh
node --input-type=module <<'EOF'
import sharp from 'sharp'

await sharp('path/to/source.jpeg')
	.autoOrient()
	.resize({ width: 1280, withoutEnlargement: true })
	.avif({ quality: 65, effort: 6 })
	.toFile('public/speaking/event-name.avif')
EOF
```

| Asset type | Resize | AVIF quality |
| --- | --- | --- |
| Speaking photos | Max width 1280 | 65 |
| Certification badges | Max width 1280 | 65 |
| App screenshots | Fit inside 1600×900 | 50 |

For app screenshots, prepare the source before converting:

1. Crop to the app UI and remove browser or desktop clutter.
2. Remove credentials, customer data, API keys, internal URLs, and personal
   notifications.
3. Keep the final width and height in `content/apps.json` to prevent layout
   shift.

For the app screenshot row, set `resize` to
`{ width: 1600, height: 900, fit: 'inside', withoutEnlargement: true }` and
write to `public/media/apps/my-app/screenshot.avif`.

Inspect text, faces, and thin borders after compression. Increase quality only
when artifacts are visible at normal display size.

## Prepare videos

Keep demos focused. Ten to twenty seconds at 720p and 24 or 30 frames per
second is normally enough to demonstrate one workflow.

Create a broadly supported MP4:

```sh
ffmpeg -i recording.mov \
  -vf "scale=1280:-2:flags=lanczos,fps=30" \
  -an -c:v libx264 -preset slow -crf 28 \
  -pix_fmt yuv420p -movflags +faststart app.mp4
```

Optionally create a smaller WebM alternative:

```sh
ffmpeg -i recording.mov \
  -vf "scale=1280:-2:flags=lanczos,fps=30" \
  -an -c:v libvpx-vp9 -crf 34 -b:v 0 \
  -row-mt 1 app.webm
```

Extract a poster frame, then convert it with the same `sharp` workflow:

```sh
ffmpeg -ss 00:00:01 -i app.mp4 -frames:v 1 /tmp/poster.png

node --input-type=module <<'EOF'
import sharp from 'sharp'

await sharp('/tmp/poster.png')
	.resize({ width: 1280, withoutEnlargement: true })
	.avif({ quality: 65, effort: 6 })
	.toFile('public/media/apps/my-app/poster.avif')
EOF
```

Keep audio only when it conveys information. Provide captions when speech is
meaningful. The site does not autoplay videos with audio.

## When to use GIF

Do not convert normal screen recordings to GIF. GIF is limited to 256 colors,
has poor compression for UI motion, and is often several times larger than an
equivalent MP4 or WebM.

Consider GIF only when all of these are true:

- The animation is under three seconds.
- It contains little motion and few colors.
- It is no wider than 640 pixels.
- The final file remains below 2 MB.
- Native video controls and pause behavior are not required.

Use video for everything else. It provides better quality, lower transfer
cost, and more accessible playback behavior.

## Add media to an app

Create one directory per app:

```text
public/media/apps/my-app/
├── screenshot.avif
├── demo.mp4
├── demo.webm
└── poster.avif
```

Then add the app to `content/apps.json`. See `content/apps.example.json` for
image and video shapes:

```json
{
	"name": "My app",
	"description": "A concise explanation of the problem and outcome.",
	"status": "active",
	"technologies": ["React", "TypeScript"],
	"liveUrl": "https://app.example",
	"media": {
		"type": "video",
		"alt": "Creating a project and viewing its generated report",
		"width": 1280,
		"height": 720,
		"poster": "/media/apps/my-app/poster.avif",
		"videoSources": {
			"mp4": "/media/apps/my-app/demo.mp4",
			"webm": "/media/apps/my-app/demo.webm"
		}
	}
}
```

Run `pnpm dev` to preview the card.

## Accessibility and privacy

- Write alt text that explains what the media demonstrates, not its colors.
- Avoid phrases such as "image of" because assistive technology already
  announces the media type.
- Add captions for meaningful speech and describe essential visual-only steps.
- Never autoplay audio.
- Verify the page with reduced motion enabled. Videos stop autoplaying when the
  operating system requests reduced motion.
- Remove private customer, employer, and personal information before export.

## Size budget

Treat these as ceilings rather than targets:

- AVIF image: 150 KB.
- Poster image: 120 KB.
- Ten-to-twenty-second video: ideally 2 MB, maximum 4 MB.
- GIF: maximum 2 MB.

If a file exceeds its ceiling, shorten the recording, reduce dimensions or
frame rate, remove audio, and then adjust codec quality.
