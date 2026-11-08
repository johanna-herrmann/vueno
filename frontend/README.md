# vueno frontend

Vue 3, TypeScript and Vite project. The Vue views are split into single-file components under `src/components`; the existing game actions are temporarily exposed through the isolated `public/legacy` adapter while the game actions are incrementally migrated to typed modules.

## Development

```sh
cd frontend
npm install
npm run dev
```

Open <http://localhost:8080>. Vite forwards `/api` requests and WebSocket traffic to the Spring Boot backend at `http://localhost:9001`.

## Build and tests

```sh
npm run test
npm run typecheck
npm run build
```

`npm run build` creates a production bundle with Vite and copies it into `../src/main/resources/static`, where Spring Boot serves it. Build the frontend before packaging the backend.
