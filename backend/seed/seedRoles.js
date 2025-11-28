import 'dotenv/config'
import mongoose from 'mongoose'
import { mongoDBURL } from '../config.js'
import Permission from '../models/Permission.js'
import Role from '../models/Role.js'

async function seed() {
  await mongoose.connect(mongoDBURL)
  console.log('Connected to DB for seeding roles/permissions')

  const permissions = [
    'invoices:create','invoices:read','invoices:update','invoices:delete',
    'users:read','users:create','users:update','users:delete',
    'campaigns:manage','expenses:manage','incomes:manage','reports:read'
  ]

  const permDocs = []
  for (const p of permissions) {
    let doc = await Permission.findOne({ name: p })
    if (!doc) doc = await Permission.create({ name: p })
    permDocs.push(doc)
  }

  // Admin role: all permissions
  let admin = await Role.findOne({ name: 'admin' })
  if (!admin) admin = await Role.create({ name: 'admin', description: 'Full administrator', permissions: permDocs.map(d => d._id) })
  else {
    admin.permissions = Array.from(new Set([...(admin.permissions || []), ...permDocs.map(d => d._id)]))
    await admin.save()
  }

  // Manager: manage campaigns, invoices read/create/update
  let manager = await Role.findOne({ name: 'manager' })
  const managerPerms = permDocs.filter(p => ['campaigns:manage','invoices:read','invoices:create','invoices:update','reports:read'].includes(p.name)).map(d => d._id)
  if (!manager) manager = await Role.create({ name: 'manager', description: 'Manager role', permissions: managerPerms })

  // User: basic read permissions
  let user = await Role.findOne({ name: 'user' })
  const userPerms = permDocs.filter(p => ['invoices:read','reports:read'].includes(p.name)).map(d => d._id)
  if (!user) user = await Role.create({ name: 'user', description: 'Default user role', permissions: userPerms })

  console.log('Seeding complete')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seeding failed', err)
  process.exit(1)
})
