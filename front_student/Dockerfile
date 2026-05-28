FROM node:18-alpine3.19 AS builder
ARG REACT_APP_API_URL=localhost:3000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:1.27-alpine-slim
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
