import mongoose from 'mongoose'
import Permission from './Permission.js'

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
}, { timestamps: true })

export default mongoose.model('Role', RoleSchema)
