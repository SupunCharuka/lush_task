import React from 'react'

export default function Header({ onDrawerToggle }) {
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
        

          <button className="avatar" aria-label="User menu">SC</button>
        </div>
      </div>
    </header>
  )
}
