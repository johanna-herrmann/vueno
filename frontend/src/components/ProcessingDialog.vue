<template>
    <div id="processingAnimation" v-if="processing"></div>
    <div id="processingEndAnimation" v-if="processingEnd"></div>
    <DialogView :app="app" />
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'
import DialogView from './DialogView.vue'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'ProcessingDialog',
  mixins: [appContextMixin],
  components: { DialogView },
}
</script>
