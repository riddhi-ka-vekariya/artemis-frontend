import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function DesignPhilosophyPage() {
  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter" id="page-design-philosophy">
        <div className="empty-state">
          <span className="empty-state-numeral">03 — Design Philosophy</span>
          <div className="gold-divider" />
          <h1 className="empty-state-heading">
            Design as <em>discipline</em>.
          </h1>
          <p className="empty-state-body">
            A set of considered principles — restraint, intention, and the
            quiet confidence of something made to last.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
