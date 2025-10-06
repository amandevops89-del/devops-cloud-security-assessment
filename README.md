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

## ⚙️ Prerequisites

* Node.js 18+
* Docker / Docker Compose
* AWS CLI & kubectl (for deployment)
* npm or yarn

---

##  Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

---

## Docker Setup

```bash

# Pull pre-built image 
docker pull amandevops1/todo-api:latest

# Run container
docker run -d \
  --name todo-api \
  -p 3000:3000 \
  -e USE_MEMORY_STORE=true \
  -e NODE_ENV=production \
  amandevops1/todo-api:latest


docker pull amandevops1/todo-api:latest


**Highlights:**

* Multi-stage Docker build (builder → runtime)
* Non-root user (`nodejs:1001`)
* Optimized image (~238MB)
* Built-in health check and signal handling (`dumb-init`)

---

## API Endpoints

### Health Check

```
GET /healthz
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-03T10:00:00.000Z",
  "commit": "abc123",
  "environment": "production"
}
```

### Todos

```
GET /api/v1/todos
POST /api/v1/todos
```

Example:

```bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'
```

### Metrics

```
GET /metrics
```

---

## Security Features

* **Non-root containers** with restricted capabilities
* **Multi-stage build** for minimal attack surface
* **Dependency scanning** (`npm audit` + Trivy)
* **Input validation** on all routes
* **Structured logging** (JSON)
* **No hardcoded secrets** – environment-based configs
* **Health endpoints** for readiness/liveness probes
* **IAM least privilege** when using DynamoDB

---

## Testing

```bash
npm test        
npm run test:watch
npm test -- --coverage
```

**Coverage:**

* Health check
* Todo CRUD
* Input validation & error handling

---

## Observability

### Logging

* **Winston**-based JSON structured logging
* Log levels: `info`, `warn`, `error`, `debug`
* Metadata: request details, latency, status code, commit SHA

### Metrics

* **Prometheus metrics** at `/metrics`
* Includes request durations, counts, and system-level stats

---

## CI/CD Pipeline — GitHub Actions

**Triggers:**

* Push to `main`
* Pull Requests

**Stages:**

1. **Build & Test** – `npm ci`, Jest tests
2. **Lint** – ESLint
3. **Security Scan** – `npm audit` + Trivy
4. **Docker Build** – multi-stage
5. **Image Scan** – gating on High/Critical
6. **Push to Registry** – Docker Hub
7. **Deploy** – AWS EKS (rolling updates)

**Pipeline Features:**

* Git SHA injection for traceability
* Build caching for faster pipelines
* Artifact uploads (coverage, scan reports)
* SBOM generation (optional bonus)

---

##  Deployment Architecture (AWS)

┌────────────────────────────────────────────────────────────┐
│                        Internet                            │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │  Application Load       │
            │  Balancer (ALB)         │
            └────────────┬────────────┘
                         │
         ┌───────────────┴────────────────┐
         │       EKS Cluster (VPC)        │
         │  ┌──────────────────────────┐  │
         │  │  Ingress Controller      │  │
         │  └──────────┬───────────────┘  │
         │             │                   │
         │  ┌──────────▼───────────────┐  │
         │  │  Todo API Service        │  │
         │  │  (2 Pod Replicas)        │  │
         │  │  - /healthz              │  │
         │  │  - /api/v1/todos         │  │
         │  └──────────┬───────────────┘  │
         │             │ IRSA              │
         │             ▼                   │
         │  ┌──────────────────────────┐  │
         │  │  Service Account         │  │
         │  │  (IAM Role via OIDC)     │  │
         │  └──────────┬───────────────┘  │
         └─────────────┼───────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   DynamoDB Table     │
            │   - Encrypted        │
            │   - PITR Enabled     │
            └──────────────────────┘


**Namespace:** `todo-api`
**ALB URL:** `k8s-todoapi-todoapii-fb332b813f-308179915.us-east-1.elb.amazonaws.com`

---

## Infrastructure & Security (IaC Highlights)

* **Terraform** for EKS, VPC, and DynamoDB provisioning
* **Secure state management** (S3 backend + DynamoDB lock)
* **IRSA** for pod-level IAM roles
* **NetworkPolicy**: deny-all + allow from ingress
* **Kubernetes security context**: non-root, drop capabilities
* **TLS**: managed via ACM
* **Secrets**: managed via AWS Secrets Manager

---

## Performance Summary

| Metric          | Result            |
| --------------- | ----------------- |
| Health Endpoint | OK (<100ms)       |
| Unit Tests      | 10/10 passed      |
| Code Coverage   | >80%              |
| ALB Health      | Healthy targets   |
| Pod Memory      | ~128Mi (of 256Mi) |
| Pod CPU         | ~100m (of 200m)   |




## Environment Variables
| Variable              | Default       | Description         |
| --------------------- | ------------- | ------------------- |
| `PORT`                | `3000`        | Server port         |
| `NODE_ENV`            | `development` | Environment mode    |
| `GIT_SHA`             | `unknown`     | Commit SHA          |
| `USE_MEMORY_STORE`    | `true`        | Use in-memory DB    |
| `AWS_REGION`          | `us-east-1`   | AWS region          |
| `DYNAMODB_TABLE_NAME` | `todos`       | DynamoDB table name |
 `EKS CLUSTER NAME`        `todo-api-dev-cluster`
---

## Verification

```bash
# Health check
curl http://$ALB_URL/healthz

# List todos
curl http://$ALB_URL/api/v1/todos

# Create todo
curl -X POST http://$ALB_URL/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo"}'

# Metrics
curl http://$ALB_URL/metrics
```



**Author:** Aman Singh
**Role:** DevOps & Cloud Security Engineer
**Cloud Provider:** AWS (EKS, ALB, DynamoDB)

