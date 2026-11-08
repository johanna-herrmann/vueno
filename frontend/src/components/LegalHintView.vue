<template>
  <!-- legalHint -->
              <div id="legalHint" v-if="currentView === 'start'">
                  Private project by Johanna Herrmann. Not related to original uno and/or its rights holder Mattel.
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'LegalHintView',
  mixins: [appContextMixin],
}
</script>
