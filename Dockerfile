FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY prisma ./prisma/

COPY tsconfig.json ./

COPY tsconfig.node.json ./

COPY prisma.config.ts ./

COPY src ./src/

ARG DATABASE_URL

RUN npm ci

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

ENTRYPOINT [ "node", "dist/server.js" ]
