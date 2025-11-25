import mongoose from 'mongoose'

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  start: { type: Date },
  end: { type: Date },
  budget: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Campaign', CampaignSchema)
