import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Wire GSAP ScrollTrigger to Lenis so all triggers fire on the same
 * eased scroll position.
 *
 * @param {import('lenis').default} lenis
 */
export function connectGSAPToLenis(lenis) {
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

/**
 * Animate the studio header (title + subtitle) on mount.
 * @param {HTMLElement} headerEl
 */
export function animateHeader(headerEl) {
  if (!headerEl) return

  const title = headerEl.querySelector('.studio-header__title')
  const sub = headerEl.querySelector('.studio-header__sub')
  const nav = headerEl.querySelector('.studio-nav')

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.fromTo(
    nav,
    { y: -20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7 }
  )
    .fromTo(
      title,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.05 },
      '-=0.3'
    )
    .fromTo(
      sub,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      '-=0.6'
    )

  return tl
}

/**
 * Scroll-driven parallax for the header title.
 * Moves up slightly as the user scrolls.
 */
export function headerParallax(headerEl, lenis) {
  if (!headerEl) return
  const title = headerEl.querySelector('.studio-header__title')

  ScrollTrigger.create({
    scroller: lenis?.wrapper || window,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      gsap.set(title, { y: self.progress * -60 })
    },
  })
}

/**
 * Wire filter tab click → highlight active tab with GSAP.
 * @param {HTMLElement} tabsEl  The container holding all filter tab buttons
 * @param {(cat: string) => void} onChange  Called with the new category string
 */
export function initFilterTabs(tabsEl, onChange) {
  if (!tabsEl) return

  const buttons = tabsEl.querySelectorAll('.studio-filter__btn')

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Remove active from all
      buttons.forEach((b) => {
        b.classList.remove('active')
        gsap.to(b, { scale: 1, duration: 0.25, ease: 'power2.out' })
      })

      // Activate clicked
      btn.classList.add('active')
      gsap.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' })

      onChange(btn.dataset.category)
    })
  })
}

/**
 * Animate project cards entering the viewport.
 * @param {NodeList|HTMLElement[]} cards
 */
export function animateCards(cards) {
  cards.forEach((card, i) => {
    gsap.fromTo(
      card,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: (i % 2) * 0.12,
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true,
        },
      }
    )
  })
}

export { gsap, ScrollTrigger }
