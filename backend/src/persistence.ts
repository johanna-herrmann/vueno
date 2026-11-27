import fs from 'node:fs';
import path from 'node:path';
import { CLASSIC_HOUSE_RULES, Game, HouseRules } from './model';

function normalizeHouseRules(value: unknown): HouseRules {
  const rules = value && typeof value === 'object' ? value as Partial<HouseRules> : {};
  return {
    mixedDrawStacking: typeof rules.mixedDrawStacking === 'boolean' ? rules.mixedDrawStacking : false,
    sevenZero: typeof rules.sevenZero === 'boolean' ? rules.sevenZero : false,
    actionStartingCard: typeof rules.actionStartingCard === 'boolean' ? rules.actionStartingCard : false,
  };
}

export class GameStore {
  readonly games = new Map<string, Game>();
  constructor(private readonly directory = path.resolve(process.env.VUENO_GAMES_PATH ?? path.join(process.env.VUENO_DATA_PATH ?? path.resolve(__dirname, '../../data'), 'games'))) {
    fs.mkdirSync(directory, { recursive: true });
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      try {
        const game = JSON.parse(fs.readFileSync(path.join(directory, entry.name), 'utf8')) as Game;
        if (game?.uuid) {
          game.lastAction = Date.now();
          game.houseRules = normalizeHouseRules(game.houseRules ?? CLASSIC_HOUSE_RULES);
          game.pendingHandSwapPlayerIndex ??= null;
          this.games.set(game.uuid, game);
        }
      } catch { /* Ignore corrupt or unrelated files, like the Java loader. */ }
    }
  }
  save(game: Game): void {
    game.lastAction = Date.now();
    fs.writeFileSync(path.join(this.directory, game.uuid), JSON.stringify(game));
  }
  delete(uuid: string): void {
    this.games.delete(uuid);
    try { fs.unlinkSync(path.join(this.directory, uuid)); } catch { /* Already gone. */ }
  }
  get(uuid: string): Game {
    const game = this.games.get(uuid);
    if (!game) throw new ApiError(404, 'There is no such game.', 'IllegalArgumentException');
    return game;
  }
}

export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly javaName = status === 400 ? 'IllegalStateException' : 'IllegalArgumentException') {
    super(message);
  }
  response() {
    const detail = this.message ? `: ${this.message}` : '';
    return { success: false, message: `failure: de.johannaherrmann.vueno.exceptions.${this.javaName}${detail}` };
  }
}
