
# DevOps & Cloud Security Engineer Assessment

This repository contains a **production-ready Node.js REST API** for Todo management, designed and deployed following **industry-grade DevOps and Cloud Security best practices**.

---

## Overview

The project demonstrates:

* A **secure, containerized Node.js microservice** with health and CRUD endpoints.
* A **fully automated CI/CD pipeline** implementing build, test, lint, audit, and image scanning stages.
* **AWS EKS-based deployment architecture** with IRSA, ALB ingress, and DynamoDB (or in-memory fallback).
* **Comprehensive security controls**, observability, and infrastructure automation.

---

## Reviewer Access & API Verification

To verify the live deployment, you can connect to the running EKS cluster through the **Application Load Balancer (ALB)**.

### **Public Endpoint**

```
ALB_URL = k8s-todoapi-todoapii-fb332b813f-308179915.us-east-1.elb.amazonaws.com
```

### **How to Test the API**

#### 1. Health Check

```bash
curl http://$ALB_URL/healthz
```

#### 2. List Existing Todos

```bash
curl http://$ALB_URL/api/v1/todos
```

#### 3. Create a New Todo

```bash
curl -X POST http://$ALB_URL/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test DynamoDB Integration"}'
```

#### 4. Verify Created Todos

```bash
curl http://$ALB_URL/api/v1/todos
```

#### 5. View Metrics

```bash
curl http://$ALB_URL/metrics
```

---

## Infrastructure Architecture & Flow

### High-Level Architecture Flow

```
                ┌───────────────────────────────┐
                │           Developer           │
                │ (Code Commit / GitHub Action) │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │         GitHub CI/CD          │
                │  - Build, Test, Scan, Deploy  │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │         AWS ECR / DockerHub    │
                │   (Container Image Registry)   │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │        AWS EKS Cluster        │
                │  - Managed Node Groups         │
                │  - IRSA (IAM Roles for SA)     │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │      Application Load Balancer│
                │  (Ingress to Service Layer)   │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │     Todo API Deployment       │
                │  - 2 Replicas (Pods)          │
                │  - /healthz, /api/v1/todos    │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │        DynamoDB Table          │
                │  - Encrypted, PITR Enabled     │
                └───────────────────────────────┘
```

---

### Visual Infrastructure Diagram (Mermaid)


flowchart TD
    A[Developer] -->|Push Code| B[GitHub Actions CI/CD]
    B -->|Builds Docker Image| C[DockerHub / ECR]
    C -->|Deploy via kubectl| D[EKS Cluster]
    D --> E[ALB Ingress Controller]
    E --> F[Todo API Pods (2 Replicas)]
    F --> G[(DynamoDB Table)]
    
    subgraph AWS Cloud
    D
    E
    F
    G
    end
```

---

## Prerequisites

* Node.js 18+
* Docker / Docker Compose
* AWS CLI & kubectl (for deployment)
* npm or yarn

---

## Local Development

```bash
npm install
npm run dev
npm test
npm run lint
```

---

## Docker Setup

```bash
docker pull amandevops1/todo-api:latest

docker run -d \
  --name todo-api \
  -p 3000:3000 \
  -e USE_MEMORY_STORE=true \
  -e NODE_ENV=production \
  amandevops1/todo-api:latest
```

**Highlights:**

* Multi-stage Docker build (builder → runtime)
* Non-root user (`nodejs:1001`)
* Optimized image (~238MB)
* Built-in health check and signal handling (`dumb-init`)

---

## API Endpoints

### Health Check

`GET /healthz`

### Todos

`GET /api/v1/todos`
`POST /api/v1/todos`

### Metrics

`GET /metrics`

---

## Security Features

* Non-root containers with restricted capabilities
* Multi-stage build for minimal attack surface
* Dependency scanning (`npm audit` + Trivy)
* Input validation on all routes
* Structured JSON logging
* No hardcoded secrets — environment-based configs
* Health endpoints for readiness/liveness probes
* IAM least privilege via IRSA when using DynamoDB

---

## Testing

```bash
npm test
npm run test:watch
npm test -- --coverage
```

---

## Observability

* Winston-based structured JSON logging
* Prometheus metrics at `/metrics`
* Tracks latency, request count, and status metrics

---

## CI/CD Pipeline (GitHub Actions)

**Triggers**

* Push to `main`
* Pull Requests

**Stages**

1. Build & Test (Jest)
2. Lint (ESLint)
3. Security Scan (npm audit + Trivy)
4. Docker Build (multi-stage)
5. Image Scan (High/Critical gating)
6. Push to Registry (Docker Hub)
7. Deploy to AWS EKS (Rolling Updates)

---

## Deployment Architecture (AWS)

```
Internet → Application Load Balancer (ALB)
             ↓
          EKS Cluster (VPC)
             ↓
      Ingress Controller
             ↓
      Todo API Service (2 Pods)
             ↓
         DynamoDB Table
```

**Namespace:** `todo-api`
**EKS Cluster Name:** `todo-api-dev-cluster`
**ALB URL:** `k8s-todoapi-todoapii-fb332b813f-308179915.us-east-1.elb.amazonaws.com`

---

## Infrastructure & Security (IaC Highlights)

* Terraform-managed EKS, VPC, and DynamoDB
* Secure state management (S3 backend + DynamoDB lock)
* IRSA for pod-level IAM
* NetworkPolicy: deny-all with selective ingress
* Kubernetes security context: non-root, drop capabilities
* TLS with AWS ACM
* Secrets managed via AWS Secrets Manager

---

## Performance Summary

| Metric          | Result          |
| --------------- | --------------- |
| Health Endpoint | OK (<100ms)     |
| Unit Tests      | 10/10 passed    |
| Code Coverage   | >80%            |
| ALB Health      | Healthy targets |
| Pod Memory      | ~128Mi of 256Mi |
| Pod CPU         | ~100m of 200m   |

---

## Environment Variables

| Variable              | Default                | Description         |
| --------------------- | ---------------------- | ------------------- |
| `PORT`                | `3000`                 | Server port         |
| `NODE_ENV`            | `development`          | Environment mode    |
| `GIT_SHA`             | `unknown`              | Commit SHA          |
| `USE_MEMORY_STORE`    | `true`                 | Use in-memory DB    |
| `AWS_REGION`          | `us-east-1`            | AWS region          |
| `DYNAMODB_TABLE_NAME` | `todos`                | DynamoDB table name |
| `EKS_CLUSTER_NAME`    | `todo-api-dev-cluster` | EKS cluster name    |

---

## Verification Commands

```bash
curl http://$ALB_URL/healthz
curl http://$ALB_URL/api/v1/todos
curl -X POST http://$ALB_URL/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo"}'
curl http://$ALB_URL/metrics
```

---

**Author:** Aman Singh
**Role:** DevOps & Cloud Security Engineer
**Cloud Provider:** AWS (EKS, ALB, DynamoDB)

---
