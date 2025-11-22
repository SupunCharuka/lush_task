import React from 'react'


export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-lg p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Lush Task</h1>
          <p className="mt-1 text-gray-500">A minimal Tailwind-only style template.</p>
        </header>

        <main>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-xl font-medium text-gray-800">Clean & Centered</h2>
              <p className="mt-2 text-gray-600">Easy-to-read typography, simple color palette and clear calls to action — all with Tailwind utilities.</p>

              <div className="mt-4 flex space-x-3">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300">Get Started</button>
                <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50">Learn More</button>
              </div>
            </div>

            <form className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <label className="block text-sm text-gray-700">Email</label>
              <input className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="you@example.com" />

              <label className="block text-sm text-gray-700 mt-3">Message</label>
              <textarea className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200" rows="3" placeholder="A short note..." />

              <div className="mt-4 flex justify-end">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500">Send</button>
              </div>
            </form>
          </div>
        </main>

        <footer className="mt-6 text-sm text-gray-500">Made with Tailwind — no extra CSS.</footer>
      </div>
    </div>
  )
}
