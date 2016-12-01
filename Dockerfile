FROM node:argon

RUN npm install -g yarn
RUN mkdir /app
COPY package.json /app/

WORKDIR /app
RUN yarn

ADD . /app

EXPOSE 3978
CMD [ "npm", "start" ]
