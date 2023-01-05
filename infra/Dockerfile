
FROM node:18-slim as client-builder
RUN apt-get update && apt-get install -y zip curl
WORKDIR /app
ARG VITE_API_HOST
ENV VITE_API_HOST $VITE_API_HOST
COPY ./client .
COPY ./cerbos /cerbos
RUN npm run build:cerbos-lite
RUN npm install
RUN VITE_API_HOST=/api npm run build

FROM node:18-slim as server-builder
RUN apt-get update && apt-get install -y openssl
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
COPY package*.json ./
COPY --chown=node:node ./server .
RUN npm config set unsafe-perm true
USER node
RUN npm install
RUN npm run build


FROM node:18-slim as production
RUN apt-get update && apt-get install -y openssl
RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app
COPY --from=server-builder /app/package*.json ./
USER node
ENV NODE_ENV=production
RUN npm ci
COPY --chown=node:node --from=server-builder /app/build ./build
COPY --chown=node:node --from=server-builder /app/prisma ./prisma
COPY --chown=node:node --from=client-builder /app/dist ./build/dist
RUN npx prisma generate
ENV NODE_ENV development
ENV SERVE_STATIC 1
EXPOSE 9080
CMD ["npm", "run", "start:prod"]

LABEL org.opencontainers.image.source=https://github.com/cerbos/demo-app-expenses