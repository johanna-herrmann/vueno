import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app';
import { GameStore } from '../src/persistence';

describe('REST API', () => {
  test('creates a game, adds players, and returns the public/private state shape', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vueno-test-'));
    const server = http.createServer(createApp(new GameStore(directory)));
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not bind');
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const created = await fetch(`${base}/api/game/create`, { method: 'POST' });
      expect(created.status).toBe(201);
      const { gameUuid } = await created.json() as { gameUuid: string };
      const add = async (name: string) => {
        const response = await fetch(`${base}/api/player/add`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ gameUuid, name, bot: false })
        });
        return response.json() as Promise<{ playerUuid: string }>;
      };
      const first = await add('Ada');
      await add('Grace');
      const state = await fetch(`${base}/api/gameState/get/${gameUuid}/${first.playerUuid}`).then(r => r.json()) as any;
      expect(state.success).toBe(true);
      expect(state.players).toHaveLength(2);
      expect(state.myIndex).toBe(0);
      expect(state.ownCards).toEqual([]);
      expect(state.game).not.toHaveProperty('uuid');
      expect(fs.existsSync(path.join(directory, gameUuid))).toBe(true);
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
