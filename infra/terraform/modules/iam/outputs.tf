output "irsa_role_arn" {
  description = "IAM role ARN for service account"
  value       = aws_iam_role.irsa.arn
}

output "irsa_role_name" {
  description = "IAM role name"
  value       = aws_iam_role.irsa.name
}

output "service_account_name" {
  description = "Service account name"
  value       = var.service_account_name
}

output "namespace" {
  description = "Kubernetes namespace"
  value       = var.namespace
}