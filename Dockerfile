FROM node:20-slim

WORKDIR /usr/src/nuxt_server/

COPY package*.json ./

RUN npm ci

RUN npm install typescript -g
RUN npm install nuxi -g

COPY . .

EXPOSE 3000 3002

# Build app
ARG NITRO_PRESET
ENV NITRO_PRESET=$NITRO_PRESET

RUN NITRO_PRESET=$NITRO_PRESET
RUN nuxt build

# Host app
CMD [ "node", ".output/server/index.mjs" ]