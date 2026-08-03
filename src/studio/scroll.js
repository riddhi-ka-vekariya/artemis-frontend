import Lenis from 'lenis'

/** Shared scroll state — read from anywhere that imports this module */
export const scrollState = {
  position: 0,
  velocity: 0,
  direction: 0,
}

let _lenis = null

/**
 * Initialise Lenis smooth scroll.
 * Returns the lenis instance so callers can do lenis.on('scroll', ...).
 *
 * @param {{ wrapper?: HTMLElement }} options
 * @returns {import('lenis').default}
 */
export function initLenis(options = {}) {
  if (_lenis) {
    _lenis.destroy()
  }

  _lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    wrapper: options.wrapper || window,
    content: options.content || document.documentElement,
  })

  _lenis.on('scroll', ({ scroll, velocity, direction }) => {
    scrollState.position = scroll
    scrollState.velocity = velocity
    scrollState.direction = direction
  })

  return _lenis
}

export function getLenis() {
  return _lenis
}

export function destroyLenis() {
  if (_lenis) {
    _lenis.destroy()
    _lenis = null
  }
}
