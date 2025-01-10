FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 4001
EXPOSE 4101

CMD [  "npm", "run", "start:migrate:prod" ]