FROM node:18-alpine3.19 AS deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:18-alpine3.19 AS build
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN yarn tsc

FROM node:18-alpine3.19 AS runtime
RUN addgroup -S service-web && adduser -S service-web -G service-web \
 && apk add --no-cache dumb-init
WORKDIR /usr/src/app
COPY --from=deps  /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build         ./build
COPY --from=build /usr/src/app/package.json  ./package.json
USER service-web

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/index.js"]
