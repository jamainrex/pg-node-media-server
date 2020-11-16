FROM illuspas/node-media-server

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --production

COPY . .

EXPOSE 1935 8000 8443

CMD ["node","app.js"]