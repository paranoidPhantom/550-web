### PREPARE ###
FROM oven/bun:debian

WORKDIR /usr/src/nuxt_prerequisites/

COPY package.json .

RUN bun install

COPY . .

### BUILD ###
FROM node:18

COPY --from=0 /usr/src/nuxt_prerequisites/ /usr/src/nuxt_build/

WORKDIR /usr/src/nuxt_build

RUN npx nuxt build

### HOST ###
FROM node:18-slim

COPY --from=1 /usr/src/nuxt_build/.output /usr/src/nuxt_server/.output

WORKDIR /usr/src/nuxt_server

EXPOSE 3000 3002

# Host app
CMD [ "node", ".output/server/index.mjs" ]