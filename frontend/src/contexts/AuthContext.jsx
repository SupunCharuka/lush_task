import React, { createContext, useContext } from 'react'

// Minimal no-op AuthContext: when removing authentication/permission checks
// this provider keeps the same API but allows all UI and API calls.
const AuthContext = createContext({
  user: null,
  setUser: () => {},
  hasRole: () => true,
  hasPermission: () => true
})

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ user: null, setUser: () => {}, hasRole: () => true, hasPermission: () => true }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
