# vueno - Webapp

The card game as online game (Webapp)

## Version
3.0.0 \
2024, May, 10th

## Description
This is a webapp, powered by SpringBoot and VueJS.

## Documentation

### API Documentation
* Swagger
  * API Doc: `/v2/api-docs`
  * UI: `/swagger-ui.html`

### Manual
* `/manual.docx` or
* `/manual.pdf`
    
## How to run
* Pre-requisite: Java (17+, tested with Java 17)
* build it with 'mvn clean package' (you will get a vueno-xx.jar file)
* run following command in terminal: java -jar vueno-xx.jar\
  (xx is the version)

## Frontend development

The Vue 3 and TypeScript project lives in `frontend`. Start the backend on port 9001, then run:

```sh
cd frontend
npm install
npm run dev
```

Open `http://localhost:8080`. The Vite development server proxies REST and WebSocket requests under `/api` to the backend. Run `npm test` (Vitest) for frontend unit tests. `npm run build` builds the frontend and copies it into `backend/static`, which the Express backend serves.

## Node backend (replacement implementation)

A TypeScript/Express backend is available in `backend`. Start it with `cd backend && npm install && npm run dev`; it uses port 9001 by default, so only one of the Java and Node backends can run on that port at a time. Its saved games use JSON under `./data/games`; existing Java-serialized saves are not compatible. See [backend/README.md](backend/README.md) for configuration, build, and Jest commands.

### Backend environment variables
* `VUENO_PORT`: Backend port (default: `9001`)
* `VUENO_HOST`: Listen address (default: `0.0.0.0`)
* `VUENO_DATA_PATH`: Data directory (default: `./data` in the repository root)
* `VUENO_GAMES_PATH`: Override the games directory (default: `${VUENO_DATA_PATH}/games`)
* `VUENO_TOKENS_DIRECTORY`: Override the token directory (default: `${VUENO_DATA_PATH}/tokens`)
* `VUENO_FEATURE_TOKENIZED_GAME_CREATE`: Enables [tokenized-game-create](#tokenized-game-create) when set to `on` (default: `off`)

### tokenized-game-create
With this feature enabled, a valid token must be provided to create a new game.

#### Enable / Disable
* Disable: `VUENO_FEATURE_TOKENIZED_GAME_CREATE=off npm run dev`
* Enable: `VUENO_FEATURE_TOKENIZED_GAME_CREATE=on npm run dev`
* Default: Disabled

#### Token
* A valid token must be provided to create a game, via URL.
  * /api/game/create/{token}
* Every authorized person should have their own token
* Token-Syntax: 2 random youtube-video-id-like strings, separated by a dot
  * Example token: Dsnmn7Twqd1.j8yZ15Ji210
* Creation and storing of tokens on backend-server
  * Creation of tokens and storing of hashes happen externally\
    (not concern of this application)
  * For every token, a bcrypt-hash of the second token part is stored under `${VUENO_DATA_PATH}/tokens`,
    while the filename is the first token part.
    * example: Hash of j8yZ15Ji210 is stored in file named Dsnmn7Twqd1
* Token validation:
  * First youtube-video-id-like string is used to search for a file named like that and load the hash from it.
  * Second youtube-video-id-like string is checked with loaded hash to validate token.
  
## License
* The source code is licensed under a CC-BY-SA-NC 4.0 Licence
  * License: https://creativecommons.org/licenses/by-nc-sa/4.0/
  * Creator: Johanna Herrmann ([johannas-kram](https://github.com/johannas-kram))
