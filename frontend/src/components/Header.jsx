import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header({ onDrawerToggle }) {
  const { user, setUser } = useAuth()

  function logout() {
    setUser(null)
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          onClick={onDrawerToggle}
          aria-label="open drawer"
          className="menu-button"
        >
          ☰
        </button>

        <div className="brand">Internal Management</div>

        <div className="header-spacer" />

        <div className="header-controls">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm">{user.name}</div>
              <button onClick={logout} className="px-2 py-1 rounded border text-sm">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="px-2 py-1 rounded border text-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
