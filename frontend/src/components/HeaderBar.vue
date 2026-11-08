<template>
<header>
  <svg class="logo"><use href="/res/svg/logo.svg#picture" /></svg>
  <a href="#" @click="toggleTheme" :class="darkMode ? 'toggleTheme toggle on' : 'toggleTheme toggle'"><span class="fas fa-sun" /></a>
  <a href="#" @click="toggleTheme" :class="!darkMode ? 'toggleTheme toggle on' : 'toggleTheme toggle'"><span class="fas fa-moon" /></a>
  <a v-if="gameLoadedWithPlayer && currentView !== 'switch-device'" :class="currentView !== 'chat' ? 'chatToggle toggle on' : 'chatToggle toggle'" href="#" @click="showChat()"><span class="fas fa-comment" /></a>
  <a v-if="gameLoadedWithPlayer" :class="currentView === 'chat' ? 'chatToggle toggle on' : 'chatToggle toggle'" href="#" @click="hideChat()"><span class="fas fa-arrow-left" /></a>
  <div id="newMessages" v-if="(currentView === 'running' || currentView === 'set_players') && readMessages < gameState.game.messages.length" />
</header>
</template>
<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'
export default { name: 'HeaderBar', mixins: [appContextMixin] }
</script>
