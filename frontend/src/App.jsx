import React, {useState} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Marketing from './pages/Marketing'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'

const drawerWidth = 240

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  return (
    <BrowserRouter>
      <div className="app-root">
        <Header onDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
        <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />

        <main className={`app-main p-4 md:ml-[${drawerWidth}px]`}>
        
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
    </BrowserRouter>
  )
}
