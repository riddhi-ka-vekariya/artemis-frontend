import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  {
    num: '01',
    title: <>Project <em>Insights</em></>,
    intro:
      'Every project begins with understanding its location, existing conditions, target audience, operational requirements, budget, and overall vision — identifying the opportunities and constraints that will shape the design.',
    sub: 'We look at',
    items: [
      'Existing site conditions',
      'Project brief & objectives',
      'Seating capacity & programme',
      'Brand & audience profile',
      'Budget & constraints',
      'Services & infrastructure',
    ],
    image: `${import.meta.env.BASE_URL}process-insights.jpg`,
    alt: 'Architectural site analysis drawn in gold ink on black paper',
  },
  {
    num: '02',
    title: <>Planning & <em>Concept</em></>,
    intro:
      'We develop the spatial strategy around audience movement, operational efficiency, visibility, comfort and functionality — auditorium layouts, circulation, foyers and support spaces as one connected experience, then define the zoning, atmosphere and identity of the cinema.',
    sub: 'Key focus areas',
    items: [
      'Space planning',
      'Auditorium configuration',
      'Seating & circulation',
      'Sightlines & movement',
      'Concept development',
    ],
    image: `${import.meta.env.BASE_URL}process-planning.jpg`,
    alt: 'Cinema auditorium seating layout and sightline diagram',
  },
  {
    num: '03',
    title: <>Design <em>Development</em></>,
    intro:
      'The concept takes shape. Materials, colours, lighting, design elements and feature details are given form to create a consistent design language — each element evaluated for practicality, durability and suitability for a high-footfall environment.',
    sub: 'This stage includes',
    items: [
      'Material & colour palettes',
      'Interior elements & details',
      'Ceiling & wall concepts',
      'Lighting concepts',
      'Design refinement',
    ],
    image: `${import.meta.env.BASE_URL}process-development.jpg`,
    alt: 'Macro study of cinema interior materials — terrazzo, brass, felt, walnut',
  },
  {
    num: '04',
    title: <><em>Visualisation</em></>,
    intro:
      'Before the design becomes reality, we make it visible. Detailed 3D visualisations communicate scale, proportions, materials, lighting and atmosphere — and provide the chance to review and refine before execution.',
    image: `${import.meta.env.BASE_URL}process-visualisation.jpg`,
    alt: 'Photorealistic 3D render of a cinema auditorium with brass fins and gold light',
  },
  {
    num: '05',
    title: <>Technical <em>Drawings</em></>,
    intro:
      'We translate the finalised concept into the technical drawings required for execution, with attention to dimensions, materials, construction details, finishes and coordination requirements.',
    sub: 'Documentation includes',
    items: [
      'Detailed layouts',
      'Floor & ceiling plans',
      'Elevations',
      'Interior details',
      'Material & finish specs',
      'Feature element details',
    ],
    image: `${import.meta.env.BASE_URL}process-technical.jpg`,
    alt: 'Technical wall section and acoustic detail drawn in gold line work',
  },
  {
    num: '06',
    title: <>Execution <em>Coordination</em></>,
    intro:
      'The process continues beyond the drawings. We provide design support to resolve queries, review proposed changes and maintain consistency between the approved design and the finished space.',
    sub: 'Support includes',
    items: [
      'Design clarifications',
      'Review of site queries',
      'Material & finish guidance',
      'Design revisions',
      'Coordination with teams',
    ],
    image: `${import.meta.env.BASE_URL}process-execution.jpg`,
    alt: 'Built detail of a brass threshold meeting a black acoustic wall',
  },
]

export default function DesignPhilosophyPage() {

  useEffect(() => {
    const rows = document.querySelectorAll('.dp-row')
    if (!rows.length) return

    // rootMargin clips 35% from top & bottom — only elements
    // crossing the central 30% band of the viewport will intersect.
    // Since each .dp-row is tall, at most one is "centred" at a time.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('dp-row--active')
          } else {
            entry.target.classList.remove('dp-row--active')
          }
        })
      },
      {
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0,
      }
    )

    rows.forEach((row) => observer.observe(row))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <main className="dp-scope page-wrapper page-enter" id="page-design-philosophy">

        {/* ── Hero ── */}
        <section className="dp-hero">
          <span className="dp-eyebrow">The Studio Method</span>
          <h1 className="dp-hero__title">
            The Design <em>Process</em>
          </h1>
          <p className="dp-hero__lede">
            From the first conversation to the final detail — a structured process
            where creative vision and practical thinking meet at every stage of the work.
          </p>
          <div className="dp-diamond-row" aria-hidden="true">
            <span className="dp-diamond" />
          </div>
        </section>

        {/* ── Process Steps Grid ── */}
        <section className="dp-grid" aria-label="Design Process Steps">
          {steps.map((s, i) => {
            const rev = i % 2 === 1
            return (
              <article key={s.num} className={`dp-row${rev ? ' dp-row--rev' : ''}`}>
                <span
                  className={`dp-num-wm ${rev ? 'dp-num-wm--r' : 'dp-num-wm--l'}`}
                  aria-hidden="true"
                >
                  {s.num}
                </span>

                {/* Image */}
                <div className="dp-row__img">
                  <div className="dp-frame">
                    <img
                      src={s.image}
                      alt={s.alt}
                      loading="lazy"
                      width={1280}
                      height={800}
                    />
                    <span className="dp-frame__gold" />
                  </div>
                </div>

                {/* Text */}
                <div className="dp-row__txt">
                  <span className="dp-phase">Stage {s.num}</span>
                  <div className="dp-row__head">
                    <span className="dp-rule" />
                    <h2 className="dp-row__title">{s.title}</h2>
                  </div>
                  <p className="dp-row__intro">{s.intro}</p>
                  {s.items && s.items.length > 0 && (
                    <>
                      {s.sub && <p className="dp-row__sub">{s.sub}</p>}
                      <ul className="dp-list">
                        {s.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </section>

        {/* ── Approach Closer ── */}
        <section className="dp-approach">
          <span className="dp-eyebrow">The Artemis Approach</span>
          <p className="dp-approach__motto">
            <b>Understand.</b> <b>Plan.</b> <b>Design.</b> <b>Detail.</b> <b>Deliver.</b>
          </p>
          <p className="dp-approach__body">
            We believe the strongest cinema environments are created when creative
            vision and practical thinking work together. Our process is structured
            to bring both into every stage of the project — from the first
            conversation to the final detail.
          </p>
        </section>

      </main>
      <Footer />
    </>
  )
}
