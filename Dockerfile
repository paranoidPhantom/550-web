### PREPARE ###
FROM oven/bun:slim as prerequisites

WORKDIR /usr/src/nuxt/

COPY package.json .

RUN bun install

COPY . .

### BUILD ###
FROM node:18-slim as build

COPY --from=prerequisites /usr/src/nuxt/ /usr/src/nuxt/

WORKDIR /usr/src/nuxt

# Get 'NITRO_PRESET' environment variable
ARG NITRO_PRESET
ENV NITRO_PRESET=$NITRO_PRESET

### HOST ###
FROM node:18-slim
# Build the app using the defined preset
RUN NITRO_PRESET=$NITRO_PRESET npx nuxt build

COPY --from=build /usr/src/nuxt/.output /usr/src/nuxt/.output

WORKDIR /usr/src/nuxt

EXPOSE 3000 3002

# Host app
CMD [ "node", ".output/server/index.mjs" ]