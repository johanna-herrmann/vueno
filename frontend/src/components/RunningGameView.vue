<template>
  <!-- running game view - shows the running game -->
              <div id="view-running" v-if="currentView === 'running'" class="view">
                  <div id="players-placeholder"></div>
                  <transition-group tag="div" id="players" name="members">
                      <div v-for="player in getPlayersListInOrder" :key="player.publicUuid" v-bind:class="getPlayerClasses(player)">
                          <div v-bind:class="`current`">
                              <div v-show="isPlayersTurn(player.index)" class="turnBar" v-bind:style="`width:${timeLeftPercent}%;`"></div>
                              <div v-show="!isPlayersTurn(player.index)" class="placeholder"></div>
                          </div>
                          <div class="name">
                              {{ getPlayerName(player.name, player.index) }}
                          </div>
                          <transition-group tag="div" name="cardCount" class="cards-count-wrapper"
                                            v-on:before-enter="cardCountBeforeEnter"
                                            v-on:enter="cardCountEnter"
                                            v-on:leave="cardCountLeave">
                              <div v-for="playerEntity in playerInSingleList(player)" :key="playerEntity.drawn" class="cards">
                                  <div class="floating-wrapper-cards">
                                      <div v-bind:class="'count ' + (playerEntity.cardCount > 9 ? ' more' : '') + (playerEntity.cardCount === 1 && playerEntity.unoSaid ? ' red' : '')">{{playerEntity.cardCount}}</div>
                                      <button v-if="playerEntity.bot" v-bind:disabled="isPlayersTurn(playerEntity.index)" class="small kick" @click="removeBotInGame(playerEntity)"><span class="fas fa-times"></span></button>
                                      <button v-if="!playerEntity.bot && isNotMe(playerEntity.index)" v-bind:disabled="playerEntity.botifyPending || botifyPlayerPending" class="small kick" @click="confirmRequestBotifyPlayer(playerEntity)"><span class="fas fa-times"></span></button>
                                      <button v-if="isMe(playerEntity.index)" class="small kick" @click="confirmLeaveRunningGame()"><span class="fas fa-times"></span></button>
                                  </div>
                              </div>
                          </transition-group>
                      </div>
                  </transition-group>
                  <div class="ruler"></div>
                  <div id="table">
                      <transition-group tag="div" id="topCard" name="topCard"
                            v-on:before-enter="topCardBeforeEnter"
                            v-on:enter="topCardEnter">
                          <div class="turn-around"
                                   v-for="topCard in topCardInSingleList"
                                   :key="topCard.uuid">
                              <svg v-bind:class="`front ${topCard.desiredColor}`">
                                  <use v-bind:href="`res/svg/cards.svg#${getCardImage(topCard)}`" />
                              </svg>
                              <img src="/res/img/back.png" alt="" class="back">
                          </div>
                      </transition-group>
                      <div id="say-uno">
                          <div>
                              <button @click="sayUno()" v-bind:disabled="!isSayUnoAllowed()"><span class="fas fa-comment"></span> Uno</button>
                          </div>
                      </div>
                      <div id="drawPile" v-bind:class="isDrawAllowed() ? 'enabled' : 'disabled'" @click="draw()">
                          <div class="floating-wrapper-draw">
                              <div class="penalties" v-if="gameState.game.turnState === 'DRAW_PENALTIES' && isMyTurn()">
                                  {{gameState.players[gameState.myIndex].drawPenalties}}
                              </div>
                              <div v-bind:class="'duties ' + (gameState.game.drawDuties > 9 ? ' more' : '')" v-if="gameState.game.turnState.startsWith('DRAW_DUTIES') && isMyTurn()">
                                  {{gameState.game.drawDuties}}
                              </div>
                          </div>
                      </div>
                      <div id="color-selection" v-if="gameState.game.turnState === 'SELECT_COLOR' && isMyTurn()">
                          <div>
                              <div>
                                  <div class="red" @click="selectColor('red')"></div>
                                  <div class="green" @click="selectColor('green')"></div>
                              </div>
                              <div>
                                  <div class="blue" @click="selectColor('blue')"></div>
                                  <div class="yellow" @click="selectColor('yellow')"></div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div id="ownCards" v-bind:class="isMyTurn() && gameState.game.turnState === 'PUT_DRAWN' ? 'putDrawn' : ''">
                      <div class="current">
                          <div v-show="isMyTurn()" class="turnBar" v-bind:style="`width:${timeLeftPercent}%;`"></div>
                          <div v-show="!isMyTurn()" class="placeholder"></div>
                      </div>
                      <transition-group tag="div" name="cards" id="own-cards-container"
                                        v-on:before-enter="ownCardsBeforeEnter"
                                        v-on:enter="ownCardsEnter"
                                        v-on:leave="ownCardsLeave">
                          <div
                              class="card"
                              v-for="(card, index) in gameState.ownCards" :key="card.uuid">
                                  <div v-bind:class="isPutAllowed(card, index) ? 'turn-around enabled' : 'turn-around disabled'" @click="put(card, index)">
                                      <svg class="front">
                                          <use v-bind:href="`res/svg/cards.svg#${getCardImage(card)}`" />
                                      </svg>
                                      <img src="/res/img/back.png" alt="" class="back">
                                  </div>
                          </div>
                      </transition-group>
                  </div>
                  <div class="putDrawn-buttons" v-if="isMyTurn() && gameState.game.turnState === 'PUT_DRAWN'">
                      <button class="small" @click="putDrawn()"><span class="fas fa-arrow-up"></span> Gezogene Karte legen</button><br><br>
                      <button class="small" @click="keep()"><span class="fas fa-arrow-right"></span> Weiter ohne zu legen</button>
                  </div>
                  <div id="bottomButtons">
                      <button class="small bottomButton switch" @click="prepareSwitchDevice()" id="in-game-switch-device"><span class="fas fa-exchange-alt"></span> Gerät wechseln</button>
                      <button v-if="!stopPartyRequested" class="small bottomButton stopParty" type="button" @click="confirmRequestStopParty()" id="stop-party"><span class="fas fa-stop"></span> Runde beenden</button>
                      <button v-if="stopPartyRequested" class="small bottomButton stopParty red" type="button" @click="revokeRequestStopParty()" id="revoke-stop-party"><span class="fas fa-ban"></span> Abbrechen</button>
                      <button class="small bottomButton leave" type="button" @click="confirmLeaveRunningGame()" id="leave-running-game"><span class="fas fa-times"></span> Spiel verlassen</button>
                  </div>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'RunningGameView',
  mixins: [appContextMixin],
}
</script>
