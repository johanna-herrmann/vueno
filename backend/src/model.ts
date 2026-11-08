import { randomUUID } from 'node:crypto';

export type CardType = 'NUMBER' | 'SKIP' | 'REVERSE' | 'JOKER' | 'DRAW_2' | 'DRAW_4';
export type TurnState = 'DRAW_PENALTIES' | 'DRAW_DUTIES_OR_CUMULATIVE' | 'PUT_OR_DRAW' | 'PUT_DRAWN' | 'SELECT_COLOR' | 'FINAL_COUNTDOWN';
export type Lifecycle = 'SET_PLAYERS' | 'RUNNING';
export interface Card {
  cardType: CardType; color: string; value: number; uuid: string;
  numberCard: boolean; jokerCard: boolean; drawCard: boolean; drawValue: number;
}
export interface Player {
  uuid: string; publicUuid: string; name: string; cards: Card[]; cardCount: number; bot: boolean;
  unoSaid: boolean; drawPenalties: number; stopPartyRequested: boolean; botifyPending: boolean; drawn: number;
}
export interface ChatMessage { content: string; playerPublicUuid: string; time: number }
export interface Game {
  uuid: string; humans: Record<string, Player>; bots: Record<string, Player>; players: Player[];
  discardPile: Card[]; drawPile: Card[]; reversed: boolean; desiredColor: string | null; currentPlayerIndex: number;
  gameLifecycle: Lifecycle; lastAction: number; turnState: TurnState; drawDuties: number; skip: boolean;
  playerIndexForPush: number; party: number; stopPartyRequested: number; lastWinner: number; messages: ChatMessage[];
  drawnCards: number; drawReason: string | null; previousFirstCardReceivers: string[];
}

export function card(type: CardType, color?: string, value = 20): Card {
  const joker = type === 'JOKER' || type === 'DRAW_4';
  const numeric = type === 'NUMBER';
  return { cardType: type, color: color ?? 'joker', value: joker ? 50 : value, uuid: randomUUID(),
    numberCard: numeric, jokerCard: joker, drawCard: type === 'DRAW_2' || type === 'DRAW_4',
    drawValue: type === 'DRAW_2' ? 2 : type === 'DRAW_4' ? 4 : 0 };
}

export function newPlayer(name: string, bot: boolean): Player {
  return { uuid: randomUUID(), publicUuid: randomUUID(), name: name.replace(/[<>'"]/g, '').trim(), cards: [], cardCount: 0,
    bot, unoSaid: false, drawPenalties: 0, stopPartyRequested: false, botifyPending: false, drawn: 0 };
}

export function newGame(): Game {
  return { uuid: randomUUID(), humans: {}, bots: {}, players: [], discardPile: [], drawPile: [], reversed: false,
    desiredColor: null, currentPlayerIndex: 0, gameLifecycle: 'SET_PLAYERS', lastAction: Date.now(), turnState: 'PUT_OR_DRAW',
    drawDuties: 0, skip: false, playerIndexForPush: 0, party: 0, stopPartyRequested: 0, lastWinner: -1,
    messages: [], drawnCards: 0, drawReason: null, previousFirstCardReceivers: [] };
}

export function playerView(p: Player) {
  return { name: p.name, cardCount: p.cards.length, bot: p.bot, unoSaid: p.unoSaid, publicUuid: p.publicUuid,
    drawPenalties: p.drawPenalties, stopPartyRequested: p.stopPartyRequested, botifyPending: p.botifyPending, drawn: p.drawn };
}
export function gameView(g: Game) {
  return { reversed: g.reversed, desiredColor: g.desiredColor, currentPlayerIndex: g.currentPlayerIndex,
    gameLifecycle: g.gameLifecycle, topCard: g.discardPile.at(-1) ?? null, lastAction: g.lastAction, turnState: g.turnState,
    drawDuties: g.drawDuties, skip: g.skip, party: g.party, stopPartyRequested: g.stopPartyRequested,
    messages: g.messages, previousFirstCardReceivers: g.previousFirstCardReceivers };
}
