import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import HeaderBar from '../src/components/HeaderBar.vue'

describe('HeaderBar', () => {
  it('delegates theme changes to the shared game state', () => {
    const toggleTheme = vi.fn()
    const app = {
      darkMode: false,
      currentView: 'start',
      gameLoadedWithPlayer: false,
      toggleTheme,
    }

    const wrapper = mount(HeaderBar, { props: { app } })
    const vm = wrapper.vm as any
    vm.toggleTheme()

    expect(toggleTheme).toHaveBeenCalledOnce()
  })
})
