FROM node:20

WORKDIR /usr/src/nuxt_server

COPY package*.json ./

RUN npm install 

RUN npm install typescript -g

COPY . .

EXPOSE 3000

# Build app
RUN npm run build

# Host app
CMD [ "node", ".output/server/index.mjs" ]