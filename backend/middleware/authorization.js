import User from '../models/User.js'

// Require that a user is authenticated and has a specific role name
export function requireRole(roleName) {
  return async (req, res, next) => {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Authentication required' })
      const has = await user.hasRole(roleName)
      if (!has) return res.status(403).json({ error: 'Forbidden' })
      next()
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  }
}

// Require a permission (checks user's roles' permissions)
export function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      const user = req.user
      if (!user) return res.status(401).json({ error: 'Authentication required' })
      const has = await user.hasPermission(permissionName)
      if (!has) return res.status(403).json({ error: 'Forbidden' })
      next()
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  }
}
