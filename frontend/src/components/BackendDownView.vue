<template>
  <!-- Backend down - error message -->
              <div v-if="currentView === 'backend-down'" id="view-backend-down">
                  <div>
                      <img src="/res/svg/backend-down.svg" alt="Verbindung zum Backend nicht verfügbar" />
                  </div>
                  <div>
                      Das Backend ist leider derzeit nicht erreichbar.<br>
                      Bitte versuche es später wieder.
                  </div>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'BackendDownView',
  mixins: [appContextMixin],
}
</script>
