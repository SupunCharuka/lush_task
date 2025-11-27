import mongoose from 'mongoose'

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
}, { _id: false })

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  items: { type: [InvoiceItemSchema], default: [] },
  subtotal: { type: Number, required: true, default: 0 },
  taxPercent: { type: Number, required: true, default: 0 },
  taxAmount: { type: Number, required: true, default: 0 },
  discount: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  dueDate: { type: Date },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  templateName: { type: String, default: 'Standard' },
  notes: { type: String, default: 'Thank you for your business!' },
  sentAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true })

export default mongoose.model('Invoice', InvoiceSchema)
