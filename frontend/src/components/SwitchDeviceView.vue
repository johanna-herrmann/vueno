<template>
  <!-- switch device view -->
              <div id="view-switch-device" v-if="currentView === 'switch-device'">
                  <button v-if="!showSwitchInQr && !showSwitchOutQr" class="small" @click="abortSwitchDevice()"><span class="fas fa-ban"></span> Abbrechen</button><br><br>
                  <span v-if="!showSwitchInQr && !showSwitchOutQr">Wie möchtest du wechseln?<br><br></span>
                  <div v-if="gameUuid !== null && gameUuid !== '' && !showSwitchInQr">
                      <button class="small" @click="prepareSwitchOut()" v-if="!showSwitchOutQr"><span class="fas fa-qrcode"></span> QR-Code anzeigen / <span class="far fa-copy"></span> Adresse kopieren</button><br><br>
                      <div v-show="showSwitchOutQr">
                          Scanne den QR-Code oder kopiere die Adresse, um den Wechsel durchzuführen.<br>
                          <button class="small" @click="copySwitchLink()"><span class="far fa-copy"></span> Adresse kopieren</button><br><br>
                          <div>
                              <img v-bind:src="qr" alt="" class="qr-image" @click="showSwitchLink()">
                          </div>
                          <button class="small" @click="abortSwitchOut()"><span class="fas fa-ban"></span> Abbrechen</button>
                      </div>
                  </div>
                  <div v-if="gameUuid === null || gameUuid === '' && !showSwitchOutQr">
                      <button class="small" @click="prepareSwitchIn()" v-if="!showSwitchInQr"><span class="fas fa-qrcode"></span> QR-Code anzeigen</button><br>
                      <div v-show="showSwitchInQr">
                          Scanne den QR-Code, um den Wechsel durchzuführen.
                          <div>
                              <img v-bind:src="qr" alt="" class="qr-image">
                          </div>
                          <button class="small" @click="abortSwitchIn()"><span class="fas fa-ban"></span> Abbrechen</button>
                      </div>
                  </div>
                  <p>
                      <button v-if="hasCamera && !showSwitchOutQr && !showSwitchInQr" class="small" @click="scanQr()"><span class="fas fa-camera"></span> QR-Code scannen</button>
                  </p>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'SwitchDeviceView',
  mixins: [appContextMixin],
}
</script>
