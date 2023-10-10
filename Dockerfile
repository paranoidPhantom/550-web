FROM ubuntu:latest

WORKDIR /usr/src/nuxt_server

COPY package*.json ./

# Node v20 installation
RUN apt-get update
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

RUN apt-get update
RUN apt-get install nodejs -y

RUN . ~/.bashrc

# Install deps
RUN npm install

COPY . .

EXPOSE 3000

# Build app
RUN npm run build

# Host app
CMD [ "node", ".output/server/index.mjs" ]