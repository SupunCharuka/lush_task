import express from 'express'
import Invoice from '../models/Invoice.js'

const router = express.Router()

function generateInvoiceNumber(){
  // Simple timestamp-based invoice number: INV-<timestamp>-<random>
  const ts = Date.now()
  const rand = Math.floor(Math.random()*9000) + 1000
  return `INV-${ts}-${rand}`
}

function calculateTotals(data){
  const items = Array.isArray(data.items) ? data.items : []
  const subtotal = items.reduce((s,i) => s + (Number(i.quantity || 0) * Number(i.price || 0)), 0)
  const taxPercent = Number(data.taxPercent || 0)
  const taxAmount = +(subtotal * (taxPercent / 100))
  const discount = Number(data.discount || 0)
  const total = +(subtotal + taxAmount - discount)
  return { subtotal, taxPercent, taxAmount, discount, total }
}

// GET /api/invoices
router.get('/invoices', async (req, res) => {
  try {
    const items = await Invoice.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/invoices/:id
router.get('/invoices/:id', async (req, res) => {
  try {
    const item = await Invoice.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Invoice not found' })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/invoices
router.post('/invoices', async (req, res) => {
  try {
    // Auto-generate invoiceNumber if not provided
    const body = { ...req.body }
    if (!body.invoiceNumber) body.invoiceNumber = generateInvoiceNumber()

    // compute totals server-side to avoid client tampering
    const calced = calculateTotals(body)
    body.subtotal = calced.subtotal
    body.taxPercent = calced.taxPercent
    body.taxAmount = calced.taxAmount
    body.discount = calced.discount
    body.total = calced.total

    // Try save; on duplicate invoiceNumber retry once
    try {
      const invoice = new Invoice(body)
      const saved = await invoice.save()
      return res.status(201).json(saved)
    } catch (err) {
      // Duplicate key error for invoiceNumber -> regenerate and retry once
      if (err && err.code === 11000 && err.message && err.message.includes('invoiceNumber')) {
        body.invoiceNumber = generateInvoiceNumber()
        const invoice = new Invoice(body)
        const saved = await invoice.save()
        return res.status(201).json(saved)
      }
      throw err
    }
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// PUT /api/invoices/:id
router.put('/invoices/:id', async (req, res) => {
  try {
    // Merge existing invoice with incoming fields, then recalculate totals
    const existing = await Invoice.findById(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Invoice not found' })

    const merged = { ...existing.toObject(), ...req.body }
    const calced = calculateTotals(merged)
    merged.subtotal = calced.subtotal
    merged.taxPercent = calced.taxPercent
    merged.taxAmount = calced.taxAmount
    merged.discount = calced.discount
    merged.total = calced.total

    const updated = await Invoice.findByIdAndUpdate(req.params.id, merged, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// DELETE /api/invoices/:id
router.delete('/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// POST /api/invoices/:id/send -> simulate sending invoice
router.post('/invoices/:id/send', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' })

    invoice.sentAt = new Date()
    if (!invoice.status) invoice.status = 'Pending'
    await invoice.save()

    // In a real app, integrate email / PDF generation here. For now return invoice and a simulated result.
    res.json({ success: true, sentAt: invoice.sentAt })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
