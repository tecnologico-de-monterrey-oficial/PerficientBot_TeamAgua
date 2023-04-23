FROM node:16.18.1-alpine3.17 AS dev-deps-front
WORKDIR /app/frontend
COPY Frontend/package.json package.json
RUN npm install --save-dev @types/node

FROM node:16.18.1-alpine3.17 AS back
WORKDIR /app/backend
COPY Backend/package.json package.json
RUN npm install
COPY Backend/ .
CMD ["npm", "start"]
EXPOSE 3000


FROM node:16.18.1-alpine3.17 AS builder
WORKDIR /app/frontend
COPY --from=dev-deps-front /app/frontend/node_modules ./node_modules
COPY Frontend/ .
RUN npm install -g @angular/cli@15.1.6
RUN ng build


FROM node:16.18.1-alpine3.17 AS prod
WORKDIR /app
COPY --from=back /app/backend .
COPY --from=builder /app/frontend/dist/frontend /app/public
CMD ["npm", "start"]
EXPOSE 3000