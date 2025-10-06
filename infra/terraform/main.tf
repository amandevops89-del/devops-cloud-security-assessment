locals {
  cluster_name = "${var.project_name}-${var.environment}-cluster"
  
  tags = merge(
    var.common_tags,
    {
      Environment = var.environment
      ClusterName = local.cluster_name
    }
  )
}

data "aws_caller_identity" "current" {}

module "vpc" {
  source = "./modules/vpc"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  
  tags = local.tags
}

module "eks" {
  source = "./modules/eks"
  
  cluster_name       = local.cluster_name
  eks_version        = var.eks_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  
  node_instance_types = var.node_instance_types
  node_desired_size   = var.node_desired_size
  node_min_size       = var.node_min_size
  node_max_size       = var.node_max_size
  
  tags = local.tags
  
  depends_on = [module.vpc]
}

module "dynamodb" {
  source = "./modules/dynamodb"
  
  table_name    = var.dynamodb_table_name
  billing_mode  = var.dynamodb_billing_mode
  environment   = var.environment
  
  tags = local.tags
}

module "iam" {
  source = "./modules/iam"
  
  cluster_name          = local.cluster_name
  oidc_provider_arn     = module.eks.oidc_provider_arn
  oidc_provider_url     = module.eks.oidc_provider_url
  dynamodb_table_arn    = module.dynamodb.table_arn
  namespace             = "default"
  service_account_name  = "todo-api-sa"
  
  tags = local.tags
  
  depends_on = [module.eks, module.dynamodb]
}