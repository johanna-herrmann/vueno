import { Server } from 'node:http';
import sockjs from 'sockjs';
import { Game, Player, TurnState } from './model';

type SockConnection = sockjs.Connection;
const connections = new Set<SockConnection>();
const subscriptions = new Map<SockConnection, Set<string>>();
let messageId = 0;

function sendFrame(connection: SockConnection, frame: string): void {
  connection.write(frame);
}

export const pushServer = sockjs.createServer({ log: () => undefined });
pushServer.on('connection', (connection: SockConnection) => {
  connections.add(connection);
  subscriptions.set(connection, new Set());
  connection.on('data', (data: string) => {
    const frames: string[] = (() => { try { const v = JSON.parse(data); return Array.isArray(v) ? v : [data]; } catch { return [data]; } })();
    for (const frame of frames) {
      const [head, ...tail] = frame.split('\n');
      const command = head?.replace(/\r$/, '');
      if (command === 'CONNECT' || command === 'STOMP') {
        sendFrame(connection, 'CONNECTED\nversion:1.1\nheart-beat:0,0\n\n\0');
      } else if (command === 'SUBSCRIBE') {
        const destination = tail.find(line => line.startsWith('destination:'))?.slice(12).trim();
        if (destination) subscriptions.get(connection)?.add(destination);
      } else if (command === 'DISCONNECT') connection.close();
    }
  });
  connection.on('close', () => { connections.delete(connection); subscriptions.delete(connection); });
});

export function publish(destinationUuid: string, body: string): void {
  const destination = `/api/push/${destinationUuid}`;
  for (const connection of connections) {
    if (subscriptions.get(connection)?.has(destination)) {
      sendFrame(connection, `MESSAGE\ndestination:${destination}\nmessage-id:${++messageId}\nsubscription:sub-0\ncontent-type:text/plain\n\n${body}\0`);
    }
  }
}

export type PushName = 'started-game'|'added-player'|'removed-player'|'botified-player'|'request-botify-player'|'cancel-botify-player'|'put-card'|'drawn-card'|'drawn-cards'|'kept-card'|'selected-color'|'said-uno'|'next-turn'|'finished-game'|'request-stop-party'|'revoke-request-stop-party'|'stop-party'|'end'|'switch-in'|'switch-finished'|'chat-message';
export function push(name: PushName, game: Game, extra?: string): void {
  const index = game.playerIndexForPush;
  const player = game.players[index];
  const enhanced: Partial<Record<PushName, string>> = {
    'started-game': `${name}:${game.currentPlayerIndex}`,
    'added-player': `${name}:${game.players.length - 1}:${game.players.at(-1)?.name ?? ''}`,
    'removed-player': `${name}:${index}`,
    'botified-player': `${name}:${index}`,
    'request-botify-player': `${name}:${player?.uuid ?? ''}`,
    'cancel-botify-player': `${name}:${player?.publicUuid ?? ''}`,
    'put-card': `${name}:${JSON.stringify(game.discardPile.at(-1))}`,
    'drawn-card': `${name}${game.turnState === 'FINAL_COUNTDOWN' ? ':countdown' : ''}`,
    'drawn-cards': `${name}:${game.drawnCards}:${game.drawReason ?? ''}`,
    'selected-color': `${name}:${game.desiredColor ?? ''}`,
    'said-uno': `${name}:${player?.cards.length ?? 0}`,
    'next-turn': `${name}:${game.currentPlayerIndex}`,
    'finished-game': `${name}:${game.party}`,
    'request-stop-party': `${name}:${index}`,
    'revoke-request-stop-party': `${name}:${index}`,
    'stop-party': `${name}:${game.party}`
  };
  publish(game.uuid, enhanced[name] ?? [name, ...(extra ? [extra] : [])].join(':'));
}
export function setPushIndex(game: Game, player: Player): void { game.playerIndexForPush = game.players.indexOf(player); }
export function currentTurnIs(game: Game, states: TurnState[]): boolean { return states.includes(game.turnState); }
export function attachPush(server: Server): void { pushServer.installHandlers(server, { prefix: '/api/ws' }); }
