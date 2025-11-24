import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Marketing from './pages/Marketing'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
