import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'

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
router.post('/users', async (req, res) => {
  try {
    const { name, email, role = 'user', password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), role, passwordHash })
    const saved = await user.save()

    // Return sanitized user data
    const out = { id: saved._id, name: saved.name, email: saved.email, role: saved.role, createdAt: saved.createdAt }
    res.status(201).json(out)
  } catch (err) {
    res.status(400).json({ message: String(err) })
  }
})

export default router
