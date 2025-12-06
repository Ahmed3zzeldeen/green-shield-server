FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY /prisma ./

COPY tsconfig.json ./

COPY tsconfig.node.json ./

COPY prisma.config.ts ./

COPY .env ./

RUN npm ci

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./

COPY --from=builder /app/dist ./dist

ENTRYPOINT [ "node", "dist/server.js" ]