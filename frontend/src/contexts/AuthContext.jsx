import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const u = JSON.parse(raw)
        setUserState(u)
        // set axios header
        const id = u.id || u._id
        if (id) axios.defaults.headers.common['Authorization'] = `Bearer ${id}`
      }
    } catch (e) {
      // ignore
    }
  }, [])

  function setUser(u) {
    if (u) {
      localStorage.setItem('user', JSON.stringify(u))
      const id = u.id || u._id
      if (id) axios.defaults.headers.common['Authorization'] = `Bearer ${id}`
      setUserState(u)
    } else {
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      setUserState(null)
    }
  }

  const hasRole = (roleName) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (Array.isArray(user.roles)) return user.roles.some(r => (r && (r.name === roleName || r === roleName)))
    return false
  }

  const hasPermission = (permName) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (Array.isArray(user.permissions) && user.permissions.includes(permName)) return true
    if (Array.isArray(user.roles)) {
      return user.roles.some(r => Array.isArray(r.permissions) && r.permissions.some(p => p.name === permName || p === permName))
    }
    return false
  }

  return (
    <AuthContext.Provider value={{ user, setUser, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
