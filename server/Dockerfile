FROM node:lts-alpine

#what dows chown do?
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

#why is this needed
USER node

RUN npm install

#what does this do exactly?
COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]
