
# Stage 1: Build Stage

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app


COPY package*.json ./


RUN npm ci --only=production


# Stage 2: Runtime Stage

FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Createing non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001


WORKDIR /app


COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules


COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs package*.json ./

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000


USER nodejs


EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]