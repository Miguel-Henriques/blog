variable "acm_certificate_arn" {
  description = "ARN of an issued ACM certificate in us-east-1."
  type        = string

  validation {
    condition = can(
      regex("^arn:aws[a-z-]*:acm:us-east-1:[0-9]{12}:certificate/", var.acm_certificate_arn)
    )
    error_message = "The ACM certificate must be in us-east-1."
  }
}

variable "aws_region" {
  description = "AWS region for the S3 origin."
  type        = string
  default     = "eu-west-1"
}

variable "domain_name" {
  description = "Apex domain served by CloudFront."
  type        = string

  validation {
    condition = (
      length(var.domain_name) > 3 &&
      !strcontains(var.domain_name, "://")
    )
    error_message = "Use a hostname only, without a protocol."
  }
}

variable "project_name" {
  description = "Short name used for AWS resources and tags."
  type        = string
  default     = "miguel-henriques-site"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Use lowercase letters, numbers, and hyphens only."
  }
}
