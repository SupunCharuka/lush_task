import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Icon({ name }){
  const common = { width: 18, height: 18, fill: 'currentColor' }
  switch(name){
    case 'dashboard': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
    )
    case 'marketing': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h6v2H7V7zm0 4h10v2H7v-2z"/></svg>
    )
    case 'income': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M12 3L2 9l10 6 10-6-10-6zm0 7.2L5.3 9 12 6.8 18.7 9 12 10.2zM2 15l10 6 10-6v2l-10 6L2 17v-2z"/></svg>
    )
    case 'expenses': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.8L5.3 7 12 4.8 18.7 7 12 9.8zM2 13l10 5 10-5v6l-10 5L2 19v-6z"/></svg>
    )
    case 'invoices': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
    )
    case 'reports': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M3 13h2v-6H3v6zm4 6h2V7H7v12zm4-4h2V3h-2v12zm4 4h2V9h-2v10zm4 0h2V5h-2v12z"/></svg>
    )
    case 'roles': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    )
    case 'users': return (
      <svg {...common} viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM6 11c1.66 0 2.99-1.34 2.99-3S7.66 5 6 5 3 6.34 3 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C13 14.17 8.33 13 6 13zm10 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-6-3.5z"/></svg>
    )
    default: return null
  }
}

export default function Sidebar({ mobileOpen, onDrawerToggle, drawerWidth = 240 }){
  const location = useLocation()
  const { user, hasRole } = useAuth()

  const baseItems = [
    {to: '/', label: 'Dashboard'},
    {to: '/marketing', label: 'Marketing'},
    {to: '/income', label: 'Income'},
    {to: '/expenses', label: 'Expenses'},
    {to: '/invoices', label: 'Invoices'},
    {to: '/reports', label: 'Reports'},
    {to: '/users/create', label: 'Create User'},
  ]

  const items = [...baseItems]
  // show Roles only to admins / users with admin role
  const isAdmin = user ? (user.role === 'admin' || hasRole('admin')) : false
  if (isAdmin) items.splice(items.length - 1, 0, { to: '/roles', label: 'Roles' })

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
