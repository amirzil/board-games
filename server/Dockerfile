FROM node:20-alpine AS base
WORKDIR /app

# Copy workspace manifests
COPY package.json ./
COPY shared/package.json shared/tsconfig.json ./shared/
COPY server/package.json server/tsconfig.json ./server/

# Install all workspace deps (this links @splendor/shared via npm workspaces)
RUN npm install --workspaces --include-workspace-root

# Copy source
COPY shared/src ./shared/src/
COPY server/src ./server/src/

WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["npx", "ts-node", "--project", "tsconfig.json", "src/index.ts"]
