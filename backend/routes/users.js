import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import Role from '../models/Role.js'

const router = express.Router()

// GET /api/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/users
// Accepts optional `roles` array (role names or ids). Falls back to legacy `role` string.
router.post('/users', async (req, res) => {
  try {
    const { name, email, role = 'user', roles = [], password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const userData = { name: name.trim(), email: email.toLowerCase().trim(), role, passwordHash }

    // Resolve roles if provided (allow names or ids).
    // Only allow assigning roles if the requester is admin (prevent privilege escalation).
    if (Array.isArray(roles) && roles.length) {
      let canAssign = false
      if (req.user) {
        if (req.user.role === 'admin') canAssign = true
        else if (typeof req.user.hasRole === 'function') {
          try { canAssign = await req.user.hasRole('admin') } catch (e) { canAssign = false }
        }
      }
      if (canAssign) {
        const resolved = []
      for (const r of roles) {
        let roleDoc = null
        if (typeof r === 'string' && /^[0-9a-fA-F]{24}$/.test(r)) {
          roleDoc = await Role.findById(r)
        }
        if (!roleDoc && typeof r === 'string') {
          roleDoc = await Role.findOne({ name: r })
        }
        if (roleDoc) resolved.push(roleDoc._id)
      }
      if (resolved.length) userData.roles = resolved
      }
    }

    const user = new User(userData)
    const saved = await user.save()

    // Return sanitized user data
    const out = { id: saved._id, name: saved.name, email: saved.email, role: saved.role, roles: saved.roles || [], createdAt: saved.createdAt }
    res.status(201).json(out)
  } catch (err) {
    res.status(400).json({ message: String(err) })
  }
})

export default router
