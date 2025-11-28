import React, { useEffect, useState } from 'react'
import { login } from '../api/user'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import StyledInput from '../components/inputs/StyledInput'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/'
      navigate(from)
    }
  }, [user, location, navigate])

  async function doLogin(e){
    if (e) e.preventDefault()
    setError('')
    if (!email || !password) return setError('Email and password are required')
    setLoading(true)
    try{
      const u = await login({ email, password })
      // setUser will store and set axios Authorization header
      setUser(u)
      const from = location.state?.from?.pathname || '/'
      navigate(from)
    }catch(err){
      console.error('Login failed', err)
      setError(err?.response?.data?.error || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-indigo-100 mt-1">Sign in to access your dashboard and reports.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded p-6">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={doLogin}>
          <div className="grid grid-cols-1 gap-4">
            <StyledInput
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4" /></svg>}
            />

            <StyledInput
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 8a5 5 0 1110 0v1h1a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h1V8zm2 1V8a3 3 0 116 0v1H7z" clipRule="evenodd" /></svg>}
            />

            <div className="flex items-center justify-between">
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading ? 'Signing in...' : 'Sign in'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
