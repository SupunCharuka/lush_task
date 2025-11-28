import express from 'express'
import Role from '../models/Role.js'
import Permission from '../models/Permission.js'
import { requireRole } from '../middleware/authorization.js'

const router = express.Router()

// GET /api/roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions')
    res.json(roles)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/roles
// body: { name, description, permissions: [ids or names] }
// Protected: only admins may create roles
router.post('/roles', requireRole('admin'), async (req, res) => {
  try {
    const { name, description = '', permissions = [] } = req.body
    if (!name) return res.status(400).json({ error: 'Role name is required' })

    // Resolve permission ids (allow names or ids)
    const permIds = []
    for (const p of permissions) {
      if (!p) continue
      if (typeof p === 'string' && /^[0-9a-fA-F]{24}$/.test(p)) {
        permIds.push(p)
        continue
      }
      // find by name
      const doc = await Permission.findOne({ name: p })
      if (doc) permIds.push(doc._id)
    }

    const existing = await Role.findOne({ name })
    if (existing) return res.status(409).json({ error: 'Role already exists' })

    const r = new Role({ name, description, permissions: permIds })
    const saved = await r.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/permissions
router.get('/permissions', async (req, res) => {
  try {
    const perms = await Permission.find().sort({ name: 1 })
    res.json(perms)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
