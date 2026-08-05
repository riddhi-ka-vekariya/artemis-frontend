import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import StudioPage from './studio/StudioPage.jsx'
import UnseenCurlDemoPage from './components/UnseenCurlDemo/UnseenCurlDemoPage.jsx'
import CartierBgPage from './components/CartierBg/CartierBgPage.jsx'
import './index.css'

// Auto-redirect direct path URLs (e.g. /artemis-frontend/bg) to HashRouter format (/#/bg)
const pathname = window.location.pathname.toLowerCase()
if (pathname.includes('/unseen') || pathname.includes('/curl')) {
  if (!window.location.hash.includes('/unseen')) {
    const base = window.location.pathname.replace(/\/unseen|\/curl\/?$/, '')
    window.location.replace(window.location.origin + base + '/#/unseen')
  }
} else if (pathname.includes('/studio')) {
  if (!window.location.hash.includes('/studio')) {
    const base = window.location.pathname.replace(/\/studio\/?$/, '')
    window.location.replace(window.location.origin + base + '/#/studio')
  }
} else if (pathname.includes('/bg')) {
  if (!window.location.hash.includes('/bg')) {
    const base = window.location.pathname.replace(/\/bg\/?$/, '')
    window.location.replace(window.location.origin + base + '/#/bg')
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/unseen" element={<UnseenCurlDemoPage />} />
        <Route path="/curl" element={<UnseenCurlDemoPage />} />
        <Route path="/bg" element={<CartierBgPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
