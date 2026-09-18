# Step 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Step 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 3000

# Start NestJS production server
CMD ["node", "dist/main.js"]
