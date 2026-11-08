<template>
  <!-- dialogs -->
              <div v-if="dialog!==null">
                  <div id="dialogBackground" @click="hideDialog()"></div>
                  <div id="dialogElement">
                      <div v-bind:class="dialog.classes">{{dialog.text}}</div>
                      <button v-if="!dialog.confirm && !dialog.timedCancel" type="button" class="small" @click="hideDialog()">OK</button>
                      <div v-if="dialog.confirm">
                          <button type="button" class="small" @click="dialog.confirmCallback">OK</button>
                          &emsp;
                          <button type="button" class="small" @click="dialog=null"><span class="fas fa-ban"></span> Abbrechen</button>
                      </div>
                      <div v-if="dialog.timedCancel">
                          <button type="button" class="small" @click="dialog.cancelCallback"><span class="fas fa-ban"></span> ({{dialog.secondsLeft}}) Abbrechen</button>
                      </div>
  
                  </div>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'DialogView',
  mixins: [appContextMixin],
}
</script>
