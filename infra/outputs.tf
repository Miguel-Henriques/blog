output "cloudfront_distribution_domain_name" {
  description = "Target for the external DNS ALIAS or ANAME record."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_hosted_zone_id" {
  description = "CloudFront hosted zone ID, if required by the DNS provider."
  value       = aws_cloudfront_distribution.site.hosted_zone_id
}

output "cloudfront_distribution_id" {
  description = "Distribution ID used for cache invalidations."
  value       = aws_cloudfront_distribution.site.id
}

output "site_bucket_name" {
  description = "Private bucket receiving the built site."
  value       = aws_s3_bucket.site.id
}

output "site_url" {
  description = "Public site URL."
  value       = "https://${var.domain_name}"
}
