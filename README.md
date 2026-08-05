# Personal blog

A personal website that serves as blog, a digital portfolio and a digital CV.

The website content is centrallised in two folders: `/content` for all text-related content and `/public` for assets such as media.

## Deployment

Deployment is handled through a Makefile. Run `make` to list all targets.

```sh
make infra-apply                  # apply Terraform (first time or infra changes)
make app-release                  # verify, build, upload, invalidate CloudFront
make cv-deploy CV=cv.pdf          # upload CV (when it changes)
```

Common targets:

| Target | Purpose |
|--------|---------|
| `infra-plan` | Preview infrastructure changes |
| `infra-apply` | Apply infrastructure changes |
| `app-release` | Lint, test, then deploy the site |
| `app-deploy` | Deploy the site without running checks |
| `cv-deploy` | Upload the CV PDF |

Run each step separately. After the first `make infra-apply`, day-to-day
updates usually need only `make app-release`.

For full details, see [docs/20-aws-deployment.md](docs/20-aws-deployment.md).

### Updating the CV

The resume is served from S3 at `/$DOMAIN_HOSTNAME-cv.pdf`. It is not bundled with the app build or uploaded by `make app-deploy`, so you can update it without redeploying the site.

```sh
make cv-deploy CV=cv.pdf
```

### Preparing media assets

To most effective way to ensure a fast load of the website is to have a lean bundle. Media assets are a major contributor to the total bundle size of this application and even though there are techniques to reduce its impact (e.g. lazy loading), the first and cheapest level of optimization is to reduce asset size.

**Note:** This is not applicable to SVGs.

#### Rules

1. Prefer AVIF as the image format for media assets
2. Establish a max width for images (e.g. 1280)

#### Conversion

Conversion can be easily done with [`sharp`](https://sharp.pixelplumbing.com/), a popular image processing lib.

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