FROM node:11 AS client
COPY client/package.json /app/client/package.json
WORKDIR /app/client
RUN npm i
COPY client/ /app/client
COPY engine /app/engine
RUN npm run build

FROM node:11 AS server
COPY server/package.json /app/package.json
WORKDIR /app
RUN npm i
COPY server/ /app
RUN npm run build

FROM node:11
COPY --from=server /app/build/ /app
COPY --from=server /app/node_modules/ /app/node_modules
COPY --from=client /app/client/build /client

WORKDIR /app
ENV STATIC_PATH /client
CMD ["/usr/local/bin/node", "main.js"]