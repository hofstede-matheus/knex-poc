FROM node:16-alpine

COPY . .

RUN npm ci

CMD [ "npm", "run", "test" ]