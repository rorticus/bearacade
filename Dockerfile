FROM node:11
COPY server/package.json /app/package.json
WORKDIR /app
RUN npm i
COPY server/ /app
RUN npm run build

FROM node:11
COPY --from=0 /app/build/ /app
COPY --from=0 /app/node_modules/ /app/node_modules
WORKDIR /app
CMD ["/usr/local/bin/node", "main.js"]