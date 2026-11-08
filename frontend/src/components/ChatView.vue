<template>
  <!-- chat -->
              <div v-if="currentView === 'chat'" id="chat-view">
                  <div class="messages" id="messages">
                      <div v-for="message in gameState.game.messages" v-bind:class="`message ${getMessageDirection(message.playerPublicUuid)}`">
                          <div class="message-content">
                              <h3><span class="name">{{getSenderName(message.playerPublicUuid)}}</span>&emsp;&emsp;&emsp;&emsp;<span class="clock">{{getMessageClock(message.time)}}</span></h3>
                              <div v-for="line in getMessageLines(message)">
                                  {{line}}
                              </div>
                          </div>
                      </div>
                      <div id="noMessages" v-if="gameState.game.messages.length === 0">
                          Es hat noch niemand etwas geschrieben.<br>
                          Du kannst gerne den Anfang machen.
                      </div>
                  </div>
                  <div id="chatPlaceholder"></div>
                  <div id="chatControls">
                      <textarea rows="1" v-model="message" placeholder="Nachricht" class="chatContent"></textarea><!--
                      --><button @click="sendMessage()" v-bind:disabled="app.message.trim() === ''" class="chatSendBtn"><span class="far fa-paper-plane"></span></button>
                  </div>
              </div>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { LegacyApp } from './appContext'
import { appContextMixin } from './appContext'

export default {
  props: { app: { type: Object as PropType<LegacyApp>, required: true } },
  name: 'ChatView',
  mixins: [appContextMixin],
}
</script>
