FROM node:17 as builder

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm ci

COPY . /app

RUN npm run build

FROM nginx:1.21-alpine

COPY --from=builder /app/public /app
RUN rm -f /app/build/bundle.js.map
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
