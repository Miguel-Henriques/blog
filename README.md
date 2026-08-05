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

For full details, see [docs/02_AWS_DEPLOYMENT.md](docs/02_AWS_DEPLOYMENT.md).

### Updating the CV

The resume is served from S3 at `/$DOMAIN_HOSTNAME-cv.pdf`. It is not bundled with the app build or uploaded by `make app-deploy`, so you can update it without redeploying the site.

```sh
make cv-deploy CV=cv.pdf
```

### Preparing media assets

See [docs/03_MANAGING_ASSETS.md](docs/03_MANAGING_ASSETS.md).