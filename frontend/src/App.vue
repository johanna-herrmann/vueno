<template>
    <HeaderBar :app="legacy" />
    <main id="vueno">
      <StartJoinView v-if="legacy.currentView === 'start' || legacy.currentView === 'join'" :app="legacy" />
      <PlayerSetupView v-if="legacy.currentView === 'set_players'" :app="legacy" />
      <RunningGameView v-if="legacy.currentView === 'running'" :app="legacy" />
      <SwitchDeviceView v-if="legacy.currentView === 'switch-device'" :app="legacy" />
      <ChatView v-if="legacy.currentView === 'chat'" :app="legacy" />
      <LegalHintView :app="legacy" />
      <WinnerView :app="legacy" />
      <BackendDownView :app="legacy" />
      <ProcessingDialog :app="legacy" />
    </main>
</template>

<script lang="ts">
import { getCurrentInstance } from 'vue'
import HeaderBar from './components/HeaderBar.vue'
import StartJoinView from './components/StartJoinView.vue'
import PlayerSetupView from './components/PlayerSetupView.vue'
import RunningGameView from './components/RunningGameView.vue'
import SwitchDeviceView from './components/SwitchDeviceView.vue'
import ChatView from './components/ChatView.vue'
import LegalHintView from './components/LegalHintView.vue'
import WinnerView from './components/WinnerView.vue'
import BackendDownView from './components/BackendDownView.vue'
import ProcessingDialog from './components/ProcessingDialog.vue'
import type { LegacyApp } from './components/appContext'

export default {
  name: 'App',
  setup() { return { legacy: getCurrentInstance()?.proxy as unknown as LegacyApp } },
  components: { HeaderBar, StartJoinView, PlayerSetupView, RunningGameView, SwitchDeviceView, ChatView, LegalHintView, WinnerView, BackendDownView, ProcessingDialog },
}
</script>
