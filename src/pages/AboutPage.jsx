import React from 'react'
import Navbar from '../components/Navbar'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="page-wrapper page-enter" id="page-about">
        <div className="empty-state">
          <span className="empty-state-numeral">04 — About Me</span>
          <div className="gold-divider" />
          <h1 className="empty-state-heading">
            The person behind the <em>work</em>.
          </h1>
          <p className="empty-state-body">
            Background, process, and the thinking that shapes every
            decision — coming soon.
          </p>
        </div>
      </main>
    </>
  )
}
