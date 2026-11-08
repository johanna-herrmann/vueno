<template>
  <!-- Set players view - From here Players can be added and removed and game round can be started -->
              <div id="view-set-players" v-if="currentView === 'set_players'" class="view">
                  <h3>Aktuelle Spieler ({{gameState.players.length}})</h3>
                  <transition-group tag="div" name="players" id="current-players">
                      <div v-for="(player, index) in gameState.players" :key="player.publicUuid" v-bind:class="getPlayerClasses(player)">
                          {{ getPlayerName(player.name, index) }}
                          <button v-if="index === gameState.myIndex" class="small" @click="leaveGame()"><span class="fas fa-times"></span> Spiel verlassen</button>
                          <button v-if="player.bot" class="small" @click="removeBot(player)"><span class="fas fa-times"></span> Bot entfernen</button>
                          <button v-if="!player.bot && index !== gameState.myIndex" v-bind:disabled="player.botifyPending || botifyPlayerPending" class="small" @click="confirmRequestBotifyPlayer(player)">
                              <span class="fas fa-times"></span>
                              <span>Spieler entfernen</span>
                          </button>
                      </div>
                  </transition-group>
                  <h3>Spieler hinzufügen</h3>
                  <div id="add-players" v-if="gameState.players.length < 8">
                      Freunde einladen:
                      <div id="invitationButtons">
                          <button class="small invitation" @click="showInvitationQrCode()"><span class="fas fa-qrcode"></span> QR-Code anzeigen</button>
                          <button class="small invitation indent" v-if="navigator.share" @click="shareLink()"><span class="fa fa-share-alt"></span> Adresse teilen</button>
                          <button class="small invitation" @click="copyLink()"><span class="far fa-copy"></span> Adresse kopieren</button>
                      </div>
                      <div v-show="showInvitationQr">
                          <div >
                              <img v-bind:src="qr" alt="" class="qr-image">
                          </div>
                          <button class="small" @click="showInvitationQr = false">ausblenden</button>
                      </div>
                      <br><br>
                      Alternativ kannst du einen computergesteuerten Gegner hinzufügen:<br>
                      <input class="small" type="text" v-model="botName" placeholder="Name (optional)">
                      <button class="small" @click="addBot()"><span class="fas fa-plus"></span> Hinzufügen</button>
                  </div>
                  <div id="add-players-limit-reached" v-if="gameState.players.length >= 8">
                      Die maximale Spieleranzahl (8) wurde erreicht.<br>
                      Es können keine weiteren Spieler teilnehmen.
                  </div>
                  <div id="start-game">
                      <button @click="startGame()"
                              v-bind:disabled="gameState.players.length < 2"><span class="fas fa-play"></span> Runde starten</button>
                      <div class="errMsg" v-if="gameState.players.length < 2">
                          Es werden mindestens 2 Spieler benötigt.
                      </div>
                  </div>
                  <p class="largeMarginBottom">
                      <button @click="prepareSwitchDevice()" class="small"><span class="fas fa-exchange-alt"></span> Gerät wechseln</button>
                  </p>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'PlayerSetupView',
  mixins: [appContextMixin],
}
</script>
