import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="w-56 border-r bg-gray-50">
      <nav>
        <div className="p-3 border-b">
          <strong>Menu</strong>
        </div>
        <NavLink to="/" end className={({isActive}) => isActive ? 'block px-4 py-2 text-gray-900 bg-gray-200' : 'block px-4 py-2 text-gray-700 hover:bg-gray-100'}>Dashboard</NavLink>
        <NavLink to="/marketing" className={({isActive}) => isActive ? 'block px-4 py-2 text-gray-900 bg-gray-200' : 'block px-4 py-2 text-gray-700 hover:bg-gray-100'}>Marketing</NavLink>
        <NavLink to="/income" className={({isActive}) => isActive ? 'block px-4 py-2 text-gray-900 bg-gray-200' : 'block px-4 py-2 text-gray-700 hover:bg-gray-100'}>Income</NavLink>
        <NavLink to="/expenses" className={({isActive}) => isActive ? 'block px-4 py-2 text-gray-900 bg-gray-200' : 'block px-4 py-2 text-gray-700 hover:bg-gray-100'}>Expenses</NavLink>
        <NavLink to="/invoices" className={({isActive}) => isActive ? 'block px-4 py-2 text-gray-900 bg-gray-200' : 'block px-4 py-2 text-gray-700 hover:bg-gray-100'}>Invoices</NavLink>
        <NavLink to="/reports" className={({isActive}) => isActive ? 'block px-4 py-2 text-gray-900 bg-gray-200' : 'block px-4 py-2 text-gray-700 hover:bg-gray-100'}>Reports</NavLink>
      </nav>
    </aside>
  )
}
