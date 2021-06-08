import { Controller } from 'stimulus'
// @ts-ignore
import hotkeys from 'hotkeys-js'

export const useHotkeys = (controller: Controller) => {
  hotkeys.filter = () => true

  for (const [hotkey, handler] of Object.entries((controller.constructor as any).hotkeys)) {
    hotkeys(hotkey, (e: Event) => (controller as { [key: string]: any })[handler as string](e))
  }
}

export const unuseHotkeys = (controller: Controller) => {
  for (const hotkey in (controller.constructor as any).hotkeys) {
    hotkeys.unbind(hotkey)
  }
}
