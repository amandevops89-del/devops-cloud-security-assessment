# DynamoDB Table for Todos

resource "aws_dynamodb_table" "todos" {
  name         = var.table_name
  billing_mode = var.billing_mode
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name        = "${var.table_name}-${var.environment}"
    Environment = var.environment
  })
}