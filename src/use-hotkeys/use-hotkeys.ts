import { Controller } from 'stimulus'
import hotkeys, { KeyHandler, HotkeysEvent } from 'hotkeys-js'
import { StimulusUse, StimulusUseOptions } from '../stimulus-use'

// from https://github.com/jaywcjlove/hotkeys/blob/master/index.d.ts
type Options = {
  scope?: string
  element?: HTMLElement | null
  keyup?: boolean | null
  keydown?: boolean | null
  splitKey?: string
}

type HotkeyDefinition = {
  handler: KeyHandler
  options: Options
}

export interface HotkeyDefinitions {
  [hotkey: string]: HotkeyDefinition
}

export interface HotkeysOptions extends StimulusUseOptions {
  hotkeys: HotkeyDefinitions
  filter?: (e: KeyboardEvent) => boolean
}

export class UseHotkeys extends StimulusUse {
  controller: Controller
  hotkeysOptions: HotkeysOptions

  constructor(controller: Controller, hotkeysOptions: HotkeysOptions) {
    super(controller, hotkeysOptions)
    this.controller = controller
    this.hotkeysOptions = hotkeysOptions
    this.enhanceController()
    this.bind()
  }

  bind = () => {
    for (const [hotkey, definition] of Object.entries(this.hotkeysOptions.hotkeys as any)) {
      const handler = (definition as HotkeyDefinition).handler.bind(this.controller)
      hotkeys(hotkey, (definition as HotkeyDefinition).options, (e: KeyboardEvent) =>
        handler(e, (e as unknown) as HotkeysEvent)
      )
    }
  }

  unbind = () => {
    for (const hotkey in this.hotkeysOptions.hotkeys as any) {
      hotkeys.unbind(hotkey)
    }
  }

  private enhanceController() {
    if (this.hotkeysOptions.filter) {
      hotkeys.filter = this.hotkeysOptions.filter
    }

    const controllerDisconnect = this.controller.disconnect.bind(this.controller)

    const disconnect = () => {
      this.unbind()
      controllerDisconnect()
    }

    Object.assign(this.controller, { disconnect })
  }
}

export const useHotkeys = (controller: Controller, hotkeysOptions: HotkeysOptions) =>
  new UseHotkeys(controller, hotkeysOptions)
