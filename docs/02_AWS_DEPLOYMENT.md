# AWS Deployment

The site builds to static files and runs from a private S3 bucket behind
CloudFront. Terraform creates the infrastructure; the deployment script uploads
the build and invalidates the CDN.

## Contents

- [Prerequisites](#prerequisites)
- [Configure Terraform](#configure-terraform)
- [Create the infrastructure](#create-the-infrastructure)
- [Configure external DNS](#configure-external-dns)
- [Enable the CloudFront Free plan](#enable-the-cloudfront-free-plan)
- [Deploy the site](#deploy-the-site)
- [Rollback](#rollback)
- [Cost controls](#cost-controls)
- [Services intentionally excluded](#services-intentionally-excluded)

## Prerequisites

Install:

- Node.js and pnpm.
- Terraform 1.10 or newer.
- AWS CLI v2.
- AWS credentials with access to S3, CloudFront, IAM policy documents, AWS
  Budgets, and the existing ACM certificate.

The ACM certificate must be issued in `us-east-1` and cover the exact apex
domain in its Subject Alternative Names. CloudFront cannot use an ACM
certificate from another region.

The external DNS provider must support an apex `ALIAS`, `ANAME`, or CNAME
flattening record. A normal CNAME is not valid at a zone apex.

## Configure Terraform

Copy the example file:

```sh
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

Set:

- `domain_name` to the apex hostname without `https://`.
- `acm_certificate_arn` to the existing `us-east-1` certificate ARN.
- `aws_region` to the region for the private S3 bucket.

`infra/terraform.tfvars` and Terraform state are ignored by Git. State remains
local to avoid creating extra infrastructure for a single-maintainer site.
Move state to a protected remote backend before collaborating with others.

## Create the infrastructure

Authenticate the AWS CLI, then run:

```sh
terraform -chdir=infra init
terraform -chdir=infra plan
terraform -chdir=infra apply
```

Review the plan before approval. Terraform creates:

- One private, encrypted, versioned S3 bucket.
- One CloudFront distribution with Origin Access Control.
- Security response headers and HTTPS enforcement.
- An optional USD 1 monthly budget notification.

The S3 bucket does not have website hosting or public access enabled.

## Configure external DNS

Read the CloudFront target:

```sh
terraform -chdir=infra output cloudfront_distribution_domain_name
```

At the external DNS provider, create an apex `ALIAS`, `ANAME`, or flattened
CNAME pointing to that CloudFront hostname. Some providers also ask for the
CloudFront hosted zone ID:

```sh
terraform -chdir=infra output cloudfront_distribution_hosted_zone_id
```

DNS propagation can take up to the record’s previous TTL. Do not remove an
existing site until the CloudFront distribution is deployed and responds over
HTTPS.

## Enable the CloudFront Free plan

CloudFront’s flat-rate Free plan is the preferred cost guardrail. At the time
this project was created, dependable Terraform AWS provider support for
subscribing to the plan was not available, so this is one deliberate manual
step.

After Terraform creates the distribution:

1. Open the CloudFront console.
2. Select the distribution.
3. Open **Manage plan**.
4. Select the `$0/month` Free plan.
5. Associate the distribution and its plan-managed resources.
6. Confirm the displayed limits and terms before subscribing.

The Free plan currently includes 1 million requests and 100 GB of data transfer
per month without overage charges. AWS can change plan terms; verify the console
before enabling it.

An AWS account using AWS’s account-level Free plan cannot subscribe to
CloudFront flat-rate plans. The AWS account must use the paid account plan even
though this CloudFront plan costs `$0`. Without the flat-rate plan, standard
pay-as-you-go pricing or promotional AWS credits apply.

The plan can attach a managed WAF web ACL. Terraform intentionally ignores
changes to the distribution’s `web_acl_id` so the next apply does not detach
that plan-managed resource.

## Deploy the site

Install dependencies and verify the project:

```sh
pnpm install
pnpm check
pnpm test
pnpm build
```

Deploy:

```sh
make app-release
```

Or deploy without running checks first:

```sh
make app-deploy
```

The deployment script:

1. Reads the Terraform bucket, distribution, and site URL outputs.
2. Builds with canonical, sitemap, and robots metadata for the real domain.
3. Uploads hashed assets with a one-year immutable cache.
4. Uploads HTML and metadata with a five-minute cache.
5. Creates a CloudFront invalidation.

App screenshots and videos use the same deployment flow. Compress media before
committing it. Follow [Managing Assets](03_MANAGING_ASSETS.md) before adding assets.

## Rollback

S3 versioning keeps replaced and deleted objects for 30 days.

To roll back:

1. Find the previous object versions in the S3 console.
2. Restore the required HTML and assets.
3. Create a CloudFront invalidation for `/*`.
4. Revert the source change so the next deployment does not reintroduce it.

Git remains the primary source of truth. S3 versions are a short recovery
window, not a substitute for version control.

## Cost controls

- Subscribe the distribution to the CloudFront Free plan when eligible.
- Keep the optional monthly budget notification enabled.
- Keep CloudFront and S3 access logs disabled unless an investigation requires
  them.
- Compress media before committing it.
- Old S3 object versions expire after 30 days.
- `PriceClass_100` limits the pay-as-you-go distribution to lower-cost edge
  regions.
- CloudFront invalidations have a free monthly allowance. Avoid unnecessary
  deployments after that allowance is exhausted.
- Review AWS Billing and Cost Explorer after the first deployment.

The architecture is designed for hobby traffic but is not a guarantee of a
zero AWS bill. Charges can still arise from standard pay-as-you-go usage,
unexpected account configuration, or services created outside this Terraform
project.

## Services intentionally excluded

- Route 53: DNS remains with the existing external provider.
- Separately billed AWS WAF: the CloudFront plan can provide managed protection.
- Lambda@Edge and CloudFront Functions: one static page needs no request
  rewriting or edge computation.
- CloudWatch and access logs: useful for analytics and incident response, but
  they create storage and ingestion costs.
- MediaConvert: local `ffmpeg` compression is enough for a small curated
  catalog.
- Dynamic image optimization: pre-generated AVIF files are cheaper and simpler.
- A database or CMS: profile and app data remain typed source files.
- Lambda, API Gateway, ECS, and load balancers: the site has no server-side
  runtime.
- Automated deployment infrastructure: always-on runners and extra IAM roles
  are unnecessary for the initial single-maintainer workflow.
- Remote Terraform state: add encrypted, locked remote state when collaboration
  or automation justifies the extra infrastructure.

Add these services only after a concrete requirement appears. None is required
to serve the current site securely.

## Other intentional design decisions

- App assets are deployed outside Terraform so infrastructure and application
  releases can follow separate lifecycles; infrastructure changes happen less
  often than application deployments.