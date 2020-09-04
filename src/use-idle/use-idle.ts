import { IdleController } from './idle-controller'
import { extendedEvent, method, composeEventName } from '../support'

const defaultEvents = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
const oneMinute = 60e3

interface IdleOptions {
  ms?: number
  initialState?: boolean
  events?: string[]
  dispatchEvent?: boolean
  eventPrefix?: boolean | string
}

const defaultOptions = {
  ms: oneMinute,
  initialState: false,
  events: defaultEvents,
  dispatchEvent: true,
  eventPrefix: true,
}

export const useIdle = (controller: IdleController, options: IdleOptions = {}) => {
  const { ms, initialState, events, dispatchEvent, eventPrefix } = Object.assign(defaultOptions, options)

  let isIdle = initialState
  let timeout = setTimeout(() => {
    isIdle = true
    dispatchAway()
  }, ms)

  const dispatchAway = (event?: Event) => {
    const eventName = composeEventName('away', controller, eventPrefix)

    controller.isIdle = true
    controller.away && method(controller, 'away').call(controller, event)

    if (dispatchEvent) {
      const clickOutsideEvent = extendedEvent(eventName, event || null, { controller })
      controller.element.dispatchEvent(clickOutsideEvent)
    }
  }

  const dispatchBack = (event?: Event) => {
    const eventName = composeEventName('back', controller, eventPrefix)

    controller.isIdle = false
    controller.back && method(controller, 'back').call(controller, event)

    if (dispatchEvent) {
      const clickOutsideEvent = extendedEvent(eventName, event || null, { controller })
      controller.element.dispatchEvent(clickOutsideEvent)
    }
  }

  const onEvent = (event: Event) => {
    if (isIdle) dispatchBack(event)

    isIdle = false
    clearTimeout(timeout)

    timeout = setTimeout(() => {
      isIdle = true
      dispatchAway(event)
    }, ms)
  }

  const onVisibility = (event: Event) => {
    if (!document.hidden) onEvent(event)
  }

  if (isIdle) {
    dispatchAway()
  } else {
    dispatchBack()
  }

  const controllerDisconnect = controller.disconnect.bind(controller)

  Object.assign(controller, {
    observeIdle() {
      events.forEach(event => {
        window.addEventListener(event, onEvent)
      })
      document.addEventListener('visibilitychange', onVisibility)
    },
    unObserveIdle() {
      events.forEach(event => {
        window.removeEventListener(event, onEvent)
      })
      document.removeEventListener('visibilitychange', onVisibility)
    },
    disconnect() {
      controller.unObserveIdle()
      controllerDisconnect()
    },
  })

  controller.observeIdle()
}
