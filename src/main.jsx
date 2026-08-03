import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import StudioPage from './studio/StudioPage.jsx'
import UnseenCurlDemoPage from './components/UnseenCurlDemo/UnseenCurlDemoPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/unseen" element={<UnseenCurlDemoPage />} />
        <Route path="/curl" element={<UnseenCurlDemoPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
