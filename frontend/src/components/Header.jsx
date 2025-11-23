import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Lush Task</h1>
          <p className="text-sm text-gray-500">A minimal Tailwind-only layout</p>
        </div>

        <nav className="space-x-4">
          <Link className="text-sm text-gray-600 hover:text-gray-900" to="/">Home</Link>
          <Link className="text-sm text-gray-600 hover:text-gray-900" to="/about">About</Link>
          <Link className="text-sm text-gray-600 hover:text-gray-900" to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
