import React, { Suspense } from 'react'
import { Experience3D } from './components/Experience3D'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner-glow" />
      <div className="loading-text">Loading 3D Chair Model...</div>
    </div>
  )
}

export default function App() {
  return (
    <main style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Suspense fallback={<LoadingScreen />}>
        <Experience3D />
      </Suspense>
    </main>
  )
}
