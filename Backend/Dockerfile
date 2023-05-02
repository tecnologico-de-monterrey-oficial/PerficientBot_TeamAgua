FROM node:16.18.1-alpine3.17 AS back
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 3000