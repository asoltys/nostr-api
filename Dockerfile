FROM node:18-alpine

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN npm i -g pnpm

COPY . /app
WORKDIR /app

RUN NODE_ENV=development NODE_OPTIONS="" pnpm i

CMD ["pnpm", "start"]
