import type { PropType } from 'vue'

export interface LegacyApp {
  [key: string]: any
}

const stateKeys = [
  'winner', 'showInvitationQr', 'showSwitchOutQr', 'showSwitchInQr', 'qr', 'gameUuid', 'playerUuid',
  'invitation', 'currentView', 'previousView', 'name', 'botName', 'gameState', 'timeLeftPercent',
  'btnCreateGameDisabled', 'btnJoinGameDisabled', 'processing', 'processingEnd', 'enableTokenizedGameCreate',
  'token', 'tokenLockedGameCreate', 'hostname', 'protocol', 'hasCamera', 'pendingRemoveAfterSwitch',
  'pendingSwitch', 'pendingPlayerIndex', 'pushUuid', 'dialog', 'refreshPageOnDialogClose', 'stopPartyRequested',
  'botifyPlayerPending', 'playerToBotify', 'message', 'readMessages', 'gameLoadedWithPlayer', 'darkMode',
  'actionLock', 'putCardIndex', 'drawnCards', 'drawReason', 'finished', 'playerWasInUnoState',
] as const

const computedKeys = ['getPlayersListInOrder', 'topCardInSingleList'] as const
const methodKeys = [
  'createGame', 'joinGame', 'leaveGame', 'addBot', 'removeBot', 'removeBotInGame', 'reset', 'loadGame',
  'loadGameWithoutPlayer', 'startGame', 'getPlayerName', 'copyLink', 'shareLink', 'showInvitationQrCode',
  'getCardImage', 'put', 'putDrawn', 'draw', 'keep', 'selectColor', 'sayUno', 'isPutAllowed', 'isDrawAllowed',
  'isSayUnoAllowed', 'isMyTurn', 'isPlayersTurn', 'isPlayerInRow', 'scanQr', 'prepareSwitchDevice',
  'abortSwitchDevice', 'prepareSwitchOut', 'abortSwitchOut', 'prepareSwitchIn', 'abortSwitchIn', 'copySwitchLink',
  'confirmLeaveRunningGame', 'confirmRequestStopParty', 'revokeRequestStopParty', 'getPlayerClasses',
  'confirmRequestBotifyPlayer', 'showChat', 'hideChat', 'sendMessage', 'getMessageDirection', 'getSenderName',
  'getMessageClock', 'getMessageLines', 'toggleTheme', 'ownCardsBeforeEnter', 'ownCardsEnter', 'ownCardsLeave',
  'topCardBeforeEnter', 'topCardEnter', 'cardCountBeforeEnter', 'cardCountEnter', 'cardCountLeave',
  'playerInSingleList', 'isMe', 'isNotMe', 'showSwitchLink', 'hideDialog',
] as const

type ComputedKey = typeof stateKeys[number] | typeof computedKeys[number]
type MethodKey = typeof methodKeys[number]

const computedBridge = Object.fromEntries(
  [...stateKeys, ...computedKeys].map((key) => [key, {
    get(this: { app: LegacyApp }) { return this.app[key] },
    set(this: { app: LegacyApp }, value: unknown) { this.app[key] = value },
  }]),
) as { [K in ComputedKey]: { get(this: { app: LegacyApp }): any; set(this: { app: LegacyApp }, value: any): void } }

const methodsBridge = Object.fromEntries(methodKeys.map((key) => [key, function (this: { app: LegacyApp }, ...args: any[]) {
  const action = this.app[key] ?? (window as any)[key]
  return typeof action === 'function' ? action(...args) : undefined
}])) as { [K in MethodKey]: (...args: any[]) => any }

export const appContextMixin = {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  computed: {
    ...computedBridge,
    navigator() { return window.navigator },
  },
  methods: methodsBridge,
}
