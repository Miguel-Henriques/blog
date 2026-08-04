#!/bin/sh

set -eu

command -v aws >/dev/null 2>&1 || {
	echo "AWS CLI is required."
	exit 1
}

command -v terraform >/dev/null 2>&1 || {
	echo "Terraform is required."
	exit 1
}

bucket_name="$(terraform -chdir=infra output -raw site_bucket_name)"
distribution_id="$(
	terraform -chdir=infra output -raw cloudfront_distribution_id
)"
site_url="$(terraform -chdir=infra output -raw site_url)"
domain_hostname="${site_url#https://}"
domain_hostname="${domain_hostname#http://}"
domain_hostname="${domain_hostname%%/*}"
cv_object="${domain_hostname}-cv.pdf"

SITE_URL="$site_url" pnpm build

aws s3 sync dist/assets "s3://$bucket_name/assets" \
	--cache-control "public,max-age=31536000,immutable" \
	--delete

aws s3 sync dist "s3://$bucket_name" \
	--cache-control "public,max-age=300,must-revalidate" \
	--delete \
	--exclude "assets/*" \
	--exclude "$cv_object"

aws cloudfront create-invalidation \
	--distribution-id "$distribution_id" \
	--paths "/*"

echo "Deployment complete: $site_url"
