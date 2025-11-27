import express from 'express'
import Income from '../models/Income.js'

const router = express.Router()

// GET /api/incomes
router.get('/incomes', async (req, res) => {
  try {
    const items = await Income.find().sort({ date: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/incomes
router.post('/incomes', async (req, res) => {
  try {
    const income = new Income(req.body)
    const saved = await income.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// PUT /api/incomes/:id
router.put('/incomes/:id', async (req, res) => {
  try {
    const updated = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// DELETE /api/incomes/:id
router.delete('/incomes/:id', async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// GET /api/incomes/monthly-summary
router.get('/incomes/monthly-summary', async (req, res) => {
  try {
    const agg = await Income.aggregate([
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
