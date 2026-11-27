<template>
  <section v-if="gameState?.game?.gameLifecycle === 'SET_PLAYERS'" class="house-rules">
    <h3>House Rules</h3>
    <label v-for="rule in rules" :key="rule.key" class="house-rule">
      <input
        type="checkbox"
        :checked="Boolean(gameState.game.houseRules?.[rule.key])"
        @change="toggle(rule.key, $event)"
      >
      <span><strong>{{ rule.label }}</strong><small>{{ rule.description }}</small></span>
    </label>
  </section>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'

type RuleKey = 'mixedDrawStacking' | 'sevenZero' | 'actionStartingCard'

export default {
  name: 'HouseRulesPanel',
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  data() {
    return {
      rules: [
        { key: 'mixedDrawStacking' as RuleKey, label: '+2/+4 stapeln', description: 'Zieh-Strafen aus +2 und +4 addieren sich.' },
        { key: 'sevenZero' as RuleKey, label: '7-0-Regel', description: 'Eine 7 tauscht Hände; eine 0 rotiert alle Hände.' },
        { key: 'actionStartingCard' as RuleKey, label: 'Aktionskarte zum Start', description: 'Die erste offene Karte darf eine Aktionskarte sein und wirkt sofort.' },
      ],
    }
  },
  computed: {
    gameState(): any { return this.app.gameState },
  },
  methods: {
    toggle(key: RuleKey, event: Event) {
      const enabled = (event.target as HTMLInputElement).checked
      const houseRules = { ...(this.app.gameState.game.houseRules ?? {}), [key]: enabled }
      this.app.updateHouseRules(houseRules)
    },
  },
}
</script>

<style scoped>
.house-rules { margin: 1rem 0; }
.house-rule { display: flex; align-items: flex-start; gap: .6rem; margin: .65rem 0; cursor: pointer; }
.house-rule input { margin-top: .25rem; }
.house-rule span { display: flex; flex-direction: column; gap: .15rem; }
.house-rule small { opacity: .8; }
</style>
