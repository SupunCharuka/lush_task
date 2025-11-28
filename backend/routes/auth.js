import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'

const router = express.Router()

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate({ path: 'roles', populate: { path: 'permissions' } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    // return sanitized user object (include roles & permissions)
    const out = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: user.roles || [],
      permissions: []
    }

    // collect permissions from roles (unique names)
    const permSet = new Set()
    for (const r of (user.roles || [])) {
      if (!r) continue
      for (const p of (r.permissions || [])) {
        if (p && p.name) permSet.add(p.name)
      }
    }
    out.permissions = Array.from(permSet)

    res.json(out)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
