import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import ViewPage from './pages/ViewPage'
import EncryptionPage from './pages/EncryptionPage'
import TelegramPage from './pages/TelegramPage'
import StoragePage from './pages/StoragePage'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/view/:id" element={<ViewPage />} />
          <Route path="/encryption" element={<EncryptionPage />} />
          <Route path="/telegram" element={<TelegramPage />} />
          <Route path="/storage" element={<StoragePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App