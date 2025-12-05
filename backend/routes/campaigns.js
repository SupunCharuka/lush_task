import express from 'express'
import Campaign from '../models/Campaign.js'

const router = express.Router()

// GET /api/campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const items = await Campaign.find().sort({start: -1})
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// POST /api/campaigns
router.post('/campaigns', async (req, res) => {
  try {
    const campaign = new Campaign(req.body)
    const saved = await campaign.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// PUT /api/campaigns/:id
router.put('/campaigns/:id', async (req, res) => {
  try {
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// DELETE /api/campaigns/:id
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: String(err) })
  }
})

// GET /api/leads-by-platform
router.get('/leads-by-platform', async (req, res) => {
  try {
    const agg = await Campaign.aggregate([
      { $group: { _id: '$platform', leads: { $sum: '$leads' } } },
      { $project: { _id: 0, platform: '$_id', leads: 1 } }
    ])
    res.json(agg)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/monthly-campaigns
router.get('/monthly-campaigns', async (req, res) => {
  try {
    const agg = await Campaign.aggregate([
      { $match: { start: { $exists: true } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$start' } },
          leads: { $sum: '$leads' },
          conversions: { $sum: '$conversions' },
          budgets: { $sum: '$budget' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const labels = agg.map(a => a._id)
    const leads = agg.map(a => a.leads)
    const conversions = agg.map(a => a.conversions)
    const budgets = agg.map(a => a.budgets)

    res.json({ labels, leads, conversions, budgets })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default router
