import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Header({ onDrawerToggle }) {
  const { user, setUser } = useAuth()

  function logout() {
    setUser(null)
  }

  return (
    <header className="app-header header-gradient">
      <div className="app-header-inner">
        <button
          onClick={onDrawerToggle}
          aria-label="open drawer"
          className="menu-button"
        >
          ☰
        </button>

        <div className="brand">Finance & Marketing</div>

        <div className="header-spacer" />

        <div className="header-controls">

          {user ? (
            <div className="user-area">
              <div className="user-name">{user.name}</div>
              <button onClick={logout} className="header-button">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="header-button">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
