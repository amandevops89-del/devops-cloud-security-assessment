# DevOps & Cloud Security Engineer Assessment

> Production-ready REST API for Todo management with comprehensive DevOps practices

## Quick Start

### Prerequisites
- Node.js 18+
- Docker
- npm or yarn

### Local Development

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

### Docker

```bash
# Build image
docker build -t todo-api:latest .

# Run container
docker run -d \
  --name todo-api \
  -p 3000:3000 \
  -e USE_MEMORY_STORE=true \
  -e NODE_ENV=production \
  todo-api:latest
```

## API Endpoints

### Health Check
```bash
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

### List Todos
```bash
GET /api/v1/todos
```

### Create Todo
```bash
POST /api/v1/todos
Content-Type: application/json

{
  "title": "Buy groceries"
}
```

### Metrics (Prometheus)
```bash
GET /metrics
```
##  Security Features

- **Non-root container** - Runs as user `nodejs:1001`
-  **Multi-stage Docker build** - Minimal attack surface
-  **Dependency scanning** - npm audit + Trivy
-  **Input validation** - Request validation on all endpoints
-  **Structured logging** - JSON logs for security monitoring
-  **Health checks** - Kubernetes readiness/liveness probes
-  **No secrets in code** - Environment-based configuration

## Testing

```bash
# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm test -- --coverage
```

**Test Coverage:**
- Health check endpoint
- Todo CRUD operations
- Input validation (empty, too long, missing fields)
- Error handling

## Observability

### Logging
- **Winston** for structured JSON logging
- Log levels: info, warn, error, debug
- Includes: request details, duration, status codes, git commit SHA

### Metrics
- **Prometheus** metrics exposed at `/metrics`
- Request duration histogram
- Request count by endpoint
- Todo creation metrics
- System metrics (CPU, memory)

## CI/CD Pipeline

### GitHub Actions Workflow

**Triggers:**
- Push to `main` branch
- Pull requests

**Stages:**
1. **Build & Test** - npm install, unit tests with coverage
2. **Lint** - ESLint code quality checks
3. **Security Audit** - npm audit for vulnerabilities
4. **Docker Build** - Multi-stage Docker image build
5. **Image Scan** - Trivy security scanning
6. **Push** - Push to Docker Hub (on main branch)
7. **Deploy** - (Future: Deploy to EKS)

### Pipeline Features
-  Git SHA injection for traceability
-  Caching for faster builds
-  Artifact uploads (coverage, scan reports)
-  Security scanning with Trivy
-  Automated Docker Hub push

## Docker

### Image Details
- **Base:** `node:18-alpine`
- **Size:** ~238MB (multi-stage optimized)
- **User:** Non-root (`nodejs:1001`)
- **Security:** dumb-init for proper signal handling
- **Health Check:** Built-in Docker health check

### Multi-Stage Build
1. **Builder stage** - Install dependencies
2. **Runtime stage** - Copy only necessary files
3. **Security** - Non-root user, minimal packages

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `GIT_SHA` | `unknown` | Git commit SHA |
| `USE_MEMORY_STORE` | `true` | Use in-memory DB instead of DynamoDB |
| `AWS_REGION` | `us-east-1` | AWS region for DynamoDB |
| `DYNAMODB_TABLE_NAME` | `todos` | DynamoDB table name |
