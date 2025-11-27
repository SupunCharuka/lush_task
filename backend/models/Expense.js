import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  vendor: { type: String },
  notes: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export default mongoose.model('Expense', ExpenseSchema)