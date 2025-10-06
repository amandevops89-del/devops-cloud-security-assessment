# IAM Role for Service Account (IRSA)

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [var.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${var.oidc_provider_url}:sub"
      values   = ["system:serviceaccount:${var.namespace}:${var.service_account_name}"]
    }
  }
}

resource "aws_iam_role" "irsa" {
  name               = "${var.cluster_name}-${var.service_account_name}-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "dynamodb_access" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]
    effect    = "Allow"
    resources = [var.dynamodb_table_arn]
  }
}

resource "aws_iam_policy" "dynamodb_access" {
  name        = "${var.cluster_name}-dynamodb-access"
  description = "Allow access to DynamoDB table"
  policy      = data.aws_iam_policy_document.dynamodb_access.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "dynamodb_access" {
  role       = aws_iam_role.irsa.name
  policy_arn = aws_iam_policy.dynamodb_access.arn
}