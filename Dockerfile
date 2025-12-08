FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY prisma ./prisma/

COPY tsconfig.json ./

COPY tsconfig.node.json ./

COPY prisma.config.ts ./

COPY src ./src/

COPY src/views ./src/views

ARG DATABASE_URL

RUN npm ci

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

COPY --from=builder /app/src/views ./views

EXPOSE 5000

ENTRYPOINT [ "node", "dist/server.js" ]
