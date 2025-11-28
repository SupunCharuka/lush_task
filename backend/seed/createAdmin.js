import 'dotenv/config'
import mongoose from 'mongoose'
import { mongoDBURL } from '../config.js'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import Role from '../models/Role.js'

async function run() {
  await mongoose.connect(mongoDBURL)
  console.log('Connected to DB for creating admin user')

  const adminRole = await Role.findOne({ name: 'admin' })
  if (!adminRole) {
    console.error('Admin role not found. Run seedRoles.js first.')
    process.exit(1)
  }

  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'password'
  const name = process.env.ADMIN_NAME || 'Admin'

  let user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10)
    user = new User({ name, email: email.toLowerCase().trim(), role: 'admin', roles: [adminRole._id], passwordHash })
    await user.save()
    console.log('Admin user created:', email)
  } else {
    user.role = 'admin'
    user.roles = Array.from(new Set([...(user.roles || []), adminRole._id]))
    await user.save()
    console.log('Existing user updated to admin:', email)
  }

  await mongoose.disconnect()
}

run().catch(err => { console.error(err); process.exit(1) })
