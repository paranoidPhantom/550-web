FROM node:20

WORKDIR /usr/src/nuxt_server

COPY package*.json ./

# Install deps
RUN npm ci

COPY . .

EXPOSE 3000

# Build app
RUN npm run build

# Host app
CMD [ "node", ".output/server/index.mjs" ]