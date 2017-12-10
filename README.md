# Bearacade Racing Game

## Client

To build the client, after installing node modules, run:

```bash
npm run build
```

This will create a `client-dist` directory that can be copied to the server.

The client can be run in webpack watch mode using `npm run dev`.

## Server

The server uses express and will be running on a different port. Because of this, the CORS headers must be set properly.

To run the server run,

```bash
npm run server
```

The server will run until it is broken out of.

Checkout `start-stop-daemon` for running the server as a daemon.  Note that the client must be configured to talk to the right server URL.  All session data will be stored in memory.

## See Also

https://codeincomplete.com/posts/javascript-racer/

https://slackapi.github.io/node-slack-sdk/
