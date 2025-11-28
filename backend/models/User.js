import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // legacy simple role string (kept for backward compatibility)
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // new: many-to-many relation to Role documents
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  passwordHash: { type: String, required: true },
}, { timestamps: true })

// Instance helper: check if user has a given role name
UserSchema.methods.hasRole = async function (roleName) {
  if (!roleName) return false
  if (this.role === 'admin' || (roleName === 'admin' && this.role === 'admin')) return true
  // ensure roles populated
  if (!this.populated('roles')) {
    await this.populate('roles')
  }
  return (this.roles || []).some(r => (r && (r.name === roleName || r === roleName)))
}

// Instance helper: check if user has a permission (by name)
UserSchema.methods.hasPermission = async function (permissionName) {
  if (!permissionName) return false
  // quick admin bypass
  if (this.role === 'admin') return true

  // populate roles -> permissions
  if (!this.populated('roles')) {
    await this.populate({ path: 'roles', populate: { path: 'permissions' } })
  }

  for (const r of (this.roles || [])) {
    if (!r) continue
    // permissions may be array of ObjectIds or populated docs
    const perms = r.permissions || []
    for (const p of perms) {
      if (!p) continue
      if (typeof p === 'string' && p === permissionName) return true
      if (p.name && p.name === permissionName) return true
    }
  }
  return false
}

export default mongoose.model('User', UserSchema)
