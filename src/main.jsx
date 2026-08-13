import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import UnseenCurlDemoPage from './components/UnseenCurlDemo/UnseenCurlDemoPage.jsx'
import HomePage             from './pages/HomePage.jsx'
import ProjectsPage         from './pages/ProjectsPage.jsx'
import DesignPhilosophyPage from './pages/DesignPhilosophyPage.jsx'
import AboutPage            from './pages/AboutPage.jsx'
import './index.css'

// Auto-redirect direct path URLs to HashRouter format
const pathname = window.location.pathname.toLowerCase()
if (pathname.includes('/unseen') || pathname.includes('/curl')) {
  if (!window.location.hash.includes('/unseen')) {
    const base = window.location.pathname.replace(/\/unseen|\/curl\/?$/, '')
    window.location.replace(window.location.origin + base + '/#/unseen')
  }
} else if (pathname.includes('/chairs')) {
  if (!window.location.hash.includes('/chairs')) {
    const base = window.location.pathname.replace(/\/chairs\/?$/, '')
    window.location.replace(window.location.origin + base + '/#/chairs')
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        {/* Portfolio pages */}
        <Route path="/home"               element={<HomePage />} />
        <Route path="/projects"           element={<ProjectsPage />} />
        <Route path="/design-philosophy"  element={<DesignPhilosophyPage />} />
        <Route path="/about"              element={<AboutPage />} />

        {/* Legacy 3D chair viewer */}
        <Route path="/chairs"  element={<App />} />
        <Route path="/unseen"  element={<UnseenCurlDemoPage />} />
        <Route path="/curl"    element={<UnseenCurlDemoPage />} />

        {/* Default: redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
