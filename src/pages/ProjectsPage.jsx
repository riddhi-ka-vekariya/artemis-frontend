import React from 'react'
import Navbar from '../components/Navbar'

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter" id="page-projects">
        <div className="empty-state">
          <span className="empty-state-numeral">02 — Projects</span>
          <div className="gold-divider" />
          <h1 className="empty-state-heading">
            Work in <em>progress</em>.
          </h1>
          <p className="empty-state-body">
            Projects coming soon. This space will hold selected work — designed
            and built with intention.
          </p>
        </div>
      </main>
    </>
  )
}
