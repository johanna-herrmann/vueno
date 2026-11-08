# vueno frontend

Vue 3, TypeScript and Vite project. The Vue views are split into single-file components under `src/components`; the former global scripts are now bundled by Vite from `src/legacy/runtime.ts`; QR scanning is a TypeScript module in `src/legacy/qrScanner.ts`. The runtime keeps the existing shared game state intact while it is split into fully typed modules. Third-party browser libraries remain under `public/vendor`.

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
