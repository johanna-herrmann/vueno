import { card, newGame, newPlayer, gameView, playerView } from '../src/model';

describe('Vueno data model', () => {
  test('creates the same initial game lifecycle and turn state', () => {
    const game = newGame();
    expect(game.gameLifecycle).toBe('SET_PLAYERS');
    expect(game.turnState).toBe('PUT_OR_DRAW');
    expect(gameView(game).topCard).toBeNull();
    expect(game.uuid).toMatch(/^[0-9a-f-]{36}$/i);
  });

  test('creates card metadata and player API view', () => {
    const drawFour = card('DRAW_4');
    const player = newPlayer('  <Ada>  ', false);
    player.cards.push(drawFour);
    expect(drawFour).toMatchObject({ cardType: 'DRAW_4', color: 'joker', value: 50, jokerCard: true, drawCard: true, drawValue: 4 });
    expect(player.name).toBe('Ada');
    expect(playerView(player)).toMatchObject({ name: 'Ada', cardCount: 1, bot: false });
    expect(playerView(player)).not.toHaveProperty('uuid');
  });
});
