import React from 'react'
import Header from './Header'
import Footer from './Footer'
import { Outlet } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-6 py-10">
        <div className="max-w-3xl mx-auto">{children ?? <Outlet />}</div>
      </main>

      <Footer />
    </div>
  )
}
