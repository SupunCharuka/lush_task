import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-6 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Lush Task. Made with Tailwind.
      </div>
    </footer>
  )
}
