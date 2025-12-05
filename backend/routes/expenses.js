import express from 'express'
import Expense from '../models/Expense.js'

const router = express.Router()

// GET /api/expenses
router.get('/expenses', async (req, res) => {
  try {
    const items = await Expense.find().sort({ date: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/expenses
router.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body)
    const saved = await expense.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// PUT /api/expenses/:id
router.put('/expenses/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// DELETE /api/expenses/:id
router.delete('/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// GET /api/expenses/monthly-summary
router.get('/expenses/monthly-summary', async (req, res) => {
  try {
    const agg = await Expense.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    const labels = agg.map(a => a._id)
    const totals = agg.map(a => a.total)
    const counts = agg.map(a => a.count)

    res.json({ labels, totals, counts })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router