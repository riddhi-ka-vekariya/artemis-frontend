import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import UnseenCurlDemoPage from './components/UnseenCurlDemo/UnseenCurlDemoPage.jsx'
import './index.css'

// Auto-redirect direct path URLs (e.g. /artemis-frontend/unseen) to HashRouter format (/#/unseen)
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
        <Route path="/" element={<App />} />
        <Route path="/chairs" element={<App />} />
        <Route path="/unseen" element={<UnseenCurlDemoPage />} />
        <Route path="/curl" element={<UnseenCurlDemoPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
