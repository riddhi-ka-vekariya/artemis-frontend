import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  {
    num: '01',
    title: <>Project <em>Insights</em></>,
    intro: [
      'Every project begins with understanding its location, existing conditions, target audience, operational requirements, budget, and overall vision. The goal is to identify the opportunities and constraints that will shape the design.',
    ],
    sub: 'We look at:',
    items: [
      'Existing site conditions',
      'Project brief and objectives',
      'Expected Seating capacity and Programme',
      'Brand and audience profile',
      'Budget and project constraints',
      'Existing services and infrastructure',
    ],
    image: `${import.meta.env.BASE_URL}process-insights.png`,
    alt: 'Architectural site analysis drawn in gold ink on black paper',
  },
  {
    num: '02',
    title: <>Planning & <em>Concept</em></>,
    intro: [
      'We begin developing the spatial strategy around audience movement, operational efficiency, visibility, comfort, and functionality. Auditorium layouts, seating arrangements, circulation, entrances, exits, foyers, and support spaces are considered as part of one connected experience.',
      'Once the planning direction is established, we develop the initial design concept, defining the zoning of all activities, atmosphere, and identity of the cinema.',
    ],
    sub: 'Key focus areas:',
    items: [
      'Space planning',
      'Auditorium configuration',
      'Seating and circulation',
      'Sightlines and audience movement',
      'Concept development',
    ],
    image: `${import.meta.env.BASE_URL}process-planning.png`,
    alt: 'Cinema auditorium seating layout and sightline diagram',
  },
  {
    num: '03',
    title: <>Design <em>Development</em></>,
    intro: [
      'This is where the concept takes shape.',
      'We refine the selected direction into a cohesive interior environment. Materials, colours, lighting, design elements, and feature details are given shape to create a consistent design language throughout the cinema.',
      'Every element is evaluated for its practicality, durability, maintenance, and suitability for a high-footfall environment.',
    ],
    sub: 'This stage includes:',
    items: [
      'Material and colour palettes',
      'Interior elements and feature details',
      'Ceiling and wall concepts',
      'Lighting concepts',
      'Design refinement',
    ],
    image: `${import.meta.env.BASE_URL}process-development.png`,
    alt: 'Macro study of cinema interior materials: terrazzo, brass, felt, walnut',
  },
  {
    num: '04',
    title: <><em>Visualisation</em></>,
    intro: [
      'Before the design becomes reality, we make it visible.',
      'Detailed 3D visualisations help communicate scale, proportions, materials, lighting, atmosphere, and the relationship between different design elements.',
      'Visualisation also provides an opportunity to review and refine the design before it moves into execution.',
    ],
    image: `${import.meta.env.BASE_URL}process-visualisation.jpg`,
    alt: 'Photorealistic 3D render of a cinema auditorium with brass fins and gold light',
  },
  {
    num: '05',
    title: <>Technical <em>Drawings</em></>,
    intro: [
      'Once the design is finalised, we translate the concept into the technical drawings required for execution. Drawings are developed with attention to dimensions, materials, construction details, finishes, and coordination requirements.',
    ],
    sub: 'Documentation includes:',
    items: [
      'Detailed layouts',
      'Floor and ceiling plans',
      'Elevations',
      'Interior details',
      'Material and finish specifications',
      'Feature Element details',
    ],
    image: `${import.meta.env.BASE_URL}process-technical.jpg`,
    alt: 'Technical wall section and acoustic detail drawn in gold line work',
  },
  {
    num: '06',
    title: <>Execution <em>coordination</em></>,
    intro: [
      'The design process continues beyond the drawings.',
      'During execution, design decisions often need clarification or refinement. We provide design support to help resolve queries, review proposed changes, and maintain consistency between the approved design and the finished space.',
      'Our role is to help ensure that the details developed during the design process translate successfully into the built environment.',
    ],
    sub: 'Support includes:',
    items: [
      'Design clarifications',
      'Review of site queries',
      'Material and finish guidance',
      'Design revisions where required',
      'Coordination with execution teams',
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
            From the first conversation to the final detail, a structured process
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
                {/* <span
                  className={`dp-num-wm ${rev ? 'dp-num-wm--r' : 'dp-num-wm--l'}`}
                  aria-hidden="true"
                >
                  {s.num}
                </span> */}

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
                  <div className="dp-row__head">
                    <span className="dp-rule" />
                    <h2 className="dp-row__title">{s.title}</h2>
                  </div>
                  {Array.isArray(s.intro) ? (
                    s.intro.map((para, pIdx) => (
                      <p key={pIdx} className="dp-row__intro">{para}</p>
                    ))
                  ) : (
                    <p className="dp-row__intro">{s.intro}</p>
                  )}
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
          <span className="dp-eyebrow">The Artemis Studios Approach:-</span>
          <p className="dp-approach__motto">
            <b>Understand.</b> <b>Plan.</b> <b>Design.</b> <b>Detail.</b> <b>Deliver.</b>
          </p>
          <p className="dp-approach__body">
            We believe the strongest cinema environments are created when creative
            vision and practical thinking work together. Our process is structured
            to bring both into every stage of the project from the first
            conversation to the final detail.
          </p>
        </section>

      </main>
      <Footer />
    </>
  )
}
