FROM node:20

WORKDIR /usr/src/nuxt_server

COPY package*.json ./

RUN npm install -g bun

# Install deps
RUN bun install
RUN bun install typescript -g

COPY . .

EXPOSE 3000

# Build app
RUN bun run build

# Host app
CMD [ "bun", ".output/server/index.mjs" ]