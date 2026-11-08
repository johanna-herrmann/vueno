<template>
  <!-- lightbox to show winner -->
              <div id="finished" class="lightbox" v-if="winner >= 0">
                  <div>
                      <svg>
                          <use v-bind:href="`res/svg/cards.svg#${getCardImage(gameState.game.topCard)}`" />
                      </svg>
                      <div v-if="winner === gameState.myIndex">
                          Herzlichen Glückwunsch, <nobr>{{getPlayerName(gameState.players[winner].name, winner)}}!</nobr><br>
                          Du hast gewonnen!
                      </div>
                      <div v-if="winner !== gameState.myIndex">
                          <nobr>{{getPlayerName(gameState.players[winner].name, winner)}}</nobr> hat gewonnen!
                      </div>
                      <button class="small" @click="winner = -1">OK</button>
                  </div>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'WinnerView',
  mixins: [appContextMixin],
}
</script>
