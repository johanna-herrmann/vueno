<template>
  <!-- Start/Join view - From here a game can be created or joined -->
              <div id="view-start" v-if="currentView === 'start' || currentView === 'join'" class="view">
                  <p v-if="!invitation">
                      Spiele das beliebte Kartenspiel UNO online am PC oder Smartphone.<br>
                      Du kannst mit Freunden spielen oder aber auch alleine gegen computergesteuerte Gegner.<br>
                  </p>
                  <p v-if="invitation">
                      Mach' mit beim beliebten Kartenspiel UNO.<br>
                      Du wurdest eingeladen, mitzuspielen. Viel Spaß!
                  </p>
                  <div v-if="currentView === 'start'">
                      <p>
                          <span v-if="enableTokenizedGameCreate">Um zu spielen brauchst du eine Einladung zum Mitspielen oder
                              einen Token zur Berechtigung, ein neues Uno-Spiels zu erstellen.</span>
                          <span v-if="!enableTokenizedGameCreate">Erstelle ein neues Uno-Spiel oder erhalte eine Einladung zum Mitspielen.</span>
                      </p>
                      <p>
                          <button v-if="currentView === 'start'" @click="createGame()"
                                  v-bind:disabled="tokenLockedGameCreate || btnCreateGameDisabled"><span v-bind:class="`far fa-${tokenLockedGameCreate ? 'meh' : 'smile-beam'}`"></span> Uno-Spiel erstellen</button><br>
                          <span v-if="tokenLockedGameCreate" class="smallButtonDescription">(Berechtigungstoken erforderlich)</span>
                      </p>
                      <p v-if="hasCamera">
                          <button @click="scanQr()" class="small"><span class="fas fa-camera"></span> QR-Code scannen</button><br>
                          <span v-if="tokenLockedGameCreate" class="smallButtonDescription">(Für Tokens, und Einladungen)</span>
                          <span v-if="!tokenLockedGameCreate" class="smallButtonDescription">(Für Einladungen)</span>
                      </p>
                      <p>
                          <button @click="prepareSwitchDevice()" class="small"><span class="fas fa-exchange-alt"></span> Gerät wechseln</button><br>
                          <span  class="smallButtonDescription">(Bestehendes Spiel hierhin wechseln)</span>
                      </p>
                  </div>
                  <div v-if="currentView === 'join'">
                      <input type="text" v-model="name" placeholder="Name (optional)">
                      <button @click="joinGame()"
                              v-bind:disabled="gameState.players.length >= 8 || gameState.game.gameLifecycle === 'RUNNING' || btnJoinGameDisabled">
                          <span class="fas fa-arrow-right"></span>
                          <span v-if="invitation">Jetzt mitspielen</span>
                          <span v-if="!invitation">Jetzt loslegen</span>
                      </button><br><br>
                      <button class="small" @click="reset()"><span class="fas fa-ban"></span> Abbrechen</button>
                  </div>
                  <div  class="errMsg" v-if="currentView === 'join' && gameState.players.length >= 8">
                      Die maximale Spieleranzahl (8) wurde erreicht.
                  </div>
                  <div  class="errMsg" v-if="currentView === 'join' && gameState.game.gameLifecycle === 'RUNNING'">
                      Das Spiel wurde bereits gestartet.
                  </div>
                  <div  class="errMsg"
                        v-if="currentView === 'join' && (gameState.players.length >= 8 || gameState.game.gameLifecycle === 'RUNNING')">
                      Es können leider keine weiteren Spieler teilnehmen.<br>
                      <button class="small" @click="reset()">Eigenes Spiel starten</button>
                  </div>
                  <p></p>
                  <div class="ruler"></div>
                  <p>
                      <a href="/manual.pdf" target="_blank"><span class="fas fa-file-pdf"></span> Bedienungs- und Spielanleitung</a>
                  </p>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'StartJoinView',
  mixins: [appContextMixin],
}
</script>
