import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

const items = [
  {to: '/', label: 'Dashboard'},
  {to: '/marketing', label: 'Marketing'},
  {to: '/income', label: 'Income'},
  {to: '/expenses', label: 'Expenses'},
  {to: '/invoices', label: 'Invoices'},
  {to: '/reports', label: 'Reports'},
  {to: '/users/create', label: 'Create User'},
  {to:'/roles', label: 'Roles'}
]

export default function Sidebar({ mobileOpen, onDrawerToggle, drawerWidth = 240 }){
  const location = useLocation()

  const content = (
    <div className="sidebar-content" role="presentation">
      <div className="sidebar-top">
        <div className="sidebar-brand">LUSH</div>
      </div>

      <nav className="sidebar-nav" aria-label="main navigation">
        {items.map(i => {
          const selected = location.pathname === i.to
          return (
            <RouterLink
              key={i.to}
              to={i.to}
              onClick={onDrawerToggle}
              className={`sidebar-item ${selected ? 'active' : ''}`}
            >
              {i.label}
            </RouterLink>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={onDrawerToggle} aria-hidden />
      )}

      {/* Mobile drawer */}
      <nav className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} aria-label="mobile menu">
        <div className="mobile-drawer-header">
          <div className="sidebar-brand">LUSH</div>
          <button onClick={onDrawerToggle} aria-label="close drawer" className="close-button">✕</button>
        </div>
        {content}
      </nav>

      {/* Desktop persistent sidebar */}
      <nav className="sidebar-desktop" aria-label="main menu" style={{width: drawerWidth}}>
        {content}
      </nav>
    </>
  )
}
