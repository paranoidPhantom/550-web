FROM node:20-slim

WORKDIR /usr/src/nuxt_server

COPY package*.json ./

RUN npm ci

RUN npm install typescript -g

COPY . .

EXPOSE 3000 3002

# Build app
RUN npm run build

# Host app
CMD [ "node", ".output/server/index.mjs" ]