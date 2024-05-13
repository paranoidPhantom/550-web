### PREPARE ###
FROM oven/bun:distroless as prerequisites

WORKDIR /usr/src/nuxt/

COPY package.json .

RUN bun install

COPY . .

### BUILD ###
FROM node:18 as build

COPY --from=prerequisites /usr/src/nuxt/ /usr/src/nuxt/

WORKDIR /usr/src/nuxt

RUN npx nuxt build

### HOST ###
FROM node:18-slim

COPY --from=build /usr/src/nuxt/.output /usr/src/nuxt/.output

WORKDIR /usr/src/nuxt

EXPOSE 3000 3002

# Host app
CMD [ "node", ".output/server/index.mjs" ]