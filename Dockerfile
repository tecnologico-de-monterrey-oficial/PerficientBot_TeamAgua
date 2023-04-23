FROM node:16.18.1-alpine3.17 AS builder
WORKDIR /app/frontend
COPY ../../Frontend/package*.json ./
RUN npm install
COPY ../../Frontend/ .
RUN ng build --prod

FROM node:16.18.1-alpine3.17
WORKDIR /app
COPY Backend/package*.json ./
RUN npm install
COPY Backend/ .
COPY --from=builder /app/frontend/dist /app/public
CMD ["npm", "start"]
EXPOSE 3000
