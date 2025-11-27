import mongoose from 'mongoose'

const IncomeSchema = new mongoose.Schema({
  type: { type: String, enum: ['payment', 'invoice', 'deposit', 'ad-hoc'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  customer: { type: String },
  invoiceNumber: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'paid' },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export default mongoose.model('Income', IncomeSchema)
