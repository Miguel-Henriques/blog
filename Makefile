.DEFAULT_GOAL := help

INFRA_DIR := infra
DEPLOY_SCRIPT := ./scripts/deploy.sh

BUCKET_NAME := $(shell terraform -chdir=$(INFRA_DIR) output -raw site_bucket_name 2>/dev/null)
DISTRIBUTION_ID := $(shell terraform -chdir=$(INFRA_DIR) output -raw cloudfront_distribution_id 2>/dev/null)
SITE_URL := $(shell terraform -chdir=$(INFRA_DIR) output -raw site_url 2>/dev/null)
DOMAIN_HOSTNAME := $(firstword $(subst /, ,$(patsubst http://%,%,$(patsubst https://%,%,$(SITE_URL)))))
CV_OBJECT := $(DOMAIN_HOSTNAME)-cv.pdf

.PHONY: help infra-plan infra-apply app-build app-verify app-deploy app-release \
	cv-deploy require-tools require-infra

help:
	@printf '%s\n' \
		'Usage: make <target>' \
		'' \
		'Infrastructure:' \
		'  infra-plan     Show pending infrastructure changes' \
		'  infra-apply    Apply infrastructure changes' \
		'' \
		'Application:' \
		'  app-build      Build dist/ with canonical site metadata' \
		'  app-verify     Run lint and tests' \
		'  app-deploy     Build, upload to S3, invalidate CloudFront' \
		'  app-release    Verify, then deploy the application' \
		'' \
		'CV:' \
		'  cv-deploy      Upload CV PDF (CV=path/to/file.pdf)'

require-tools:
	@command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required."; exit 1; }
	@command -v terraform >/dev/null 2>&1 || { echo "Terraform is required."; exit 1; }
	@command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required."; exit 1; }

require-infra: require-tools
	@test -n "$(BUCKET_NAME)" || { \
		echo "Terraform outputs are unavailable. Run 'make infra-apply' first."; \
		exit 1; \
	}

infra-plan: require-tools
	terraform -chdir=$(INFRA_DIR) plan

infra-apply: require-tools
	terraform -chdir=$(INFRA_DIR) apply

app-build: require-tools
	@test -n "$(SITE_URL)" || { \
		echo "SITE_URL is unavailable. Run 'make infra-apply' first."; \
		exit 1; \
	}
	SITE_URL="$(SITE_URL)" pnpm build

app-verify: require-tools
	pnpm check
	pnpm test

app-deploy: require-infra
	sh $(DEPLOY_SCRIPT)

app-release: app-verify app-deploy

cv-deploy: require-infra
	@test -n "$(CV)" || { \
		echo "Usage: make cv-deploy CV=path/to/your-cv.pdf"; \
		exit 1; \
	}
	@test -f "$(CV)" || { echo "CV file not found: $(CV)"; exit 1; }
	aws s3 cp "$(CV)" "s3://$(BUCKET_NAME)/$(CV_OBJECT)" \
		--content-type "application/pdf" \
		--cache-control "public,max-age=0,must-revalidate"
	aws cloudfront create-invalidation \
		--distribution-id "$(DISTRIBUTION_ID)" \
		--paths "/$(CV_OBJECT)"
	@echo "CV uploaded: $(SITE_URL)/$(CV_OBJECT)"
