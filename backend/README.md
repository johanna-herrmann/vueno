# Vueno Node backend

TypeScript/Express replacement backend with the same REST routes and SockJS/STOMP push destination used by the Vue application.

## Run

```sh
cd backend
npm install
npm run dev
```

The server listens on `0.0.0.0:9001` by default. Set `PORT` and `HOST` to override them. It uses the repository's `./data/games` directory for JSON game files and `./data/tokens` for token files. Override the data root with `DATA_PATH`, or set `GAMES_PATH` and `TOKENS_DIRECTORY` separately.

Express serves static assets from `backend/static`. Build them with `cd frontend && npm run build`; the generated directory is ignored by Git.

`FEATURE_TOKENIZED_GAME_CREATE=on` enables the same 11-character dot-separated token scheme. Token files contain bcrypt hashes, named after the first token segment.

The Java backend remains in the repository and uses the same default port, so run only one backend at a time. Existing Java-serialized saves are not read; Node saves JSON files. The REST surface and `/api/ws` SockJS/STOMP endpoint match the existing Vue client.

## Build and tests

```sh
npm test
npm run build
npm start
```
