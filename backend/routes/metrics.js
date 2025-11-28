import express from 'express'
import Income from '../models/Income.js'
import Expense from '../models/Expense.js'
import { requirePermission } from '../middleware/authorization.js'

const router = express.Router()

// GET /api/metrics/yearly?year=2025
router.get('/yearly', requirePermission('reports:read'), async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10)
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)

    const incomeAgg = await Income.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
      { $sort: { '_id': 1 } }
    ])

    const expenseAgg = await Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: '$date' }, total: { $sum: '$amount' } } },
      { $sort: { '_id': 1 } }
    ])

    const expenseBreakdown = await Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ])

    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const incomesByMonth = months.map(m => {
      const it = incomeAgg.find(x => x._id === m)
      return it ? it.total : 0
    })
    const expensesByMonth = months.map(m => {
      const it = expenseAgg.find(x => x._id === m)
      return it ? it.total : 0
    })

    const totalRevenue = incomesByMonth.reduce((a, b) => a + b, 0)
    const totalExpense = expensesByMonth.reduce((a, b) => a + b, 0)
    const profit = totalRevenue - totalExpense

    res.json({
      year,
      incomesByMonth,
      expensesByMonth,
      totalRevenue,
      totalExpense,
      profit,
      expenseBreakdown: expenseBreakdown.map(x => ({ category: x._id, total: x.total }))
    })
  } catch (err) {
    console.error('metrics/yearly error', err)
    res.status(500).json({ error: String(err) })
  }
})

// GET /api/metrics/monthly?year=2025&month=11
router.get('/monthly', requirePermission('reports:read'), async (req, res) => {
  try {
    const year = parseInt(req.query.year || new Date().getFullYear(), 10)
    const month = parseInt(req.query.month || (new Date().getMonth() + 1), 10) // 1-12
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 1)

    const incomeAgg = await Income.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])
    const expenseAgg = await Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ])

    const expenseBreakdown = await Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ])

    const totalRevenue = incomeAgg[0]?.total || 0
    const totalExpense = expenseAgg[0]?.total || 0
    const profit = totalRevenue - totalExpense

    res.json({ year, month, totalRevenue, totalExpense, profit, expenseBreakdown: expenseBreakdown.map(x => ({ category: x._id, total: x.total })) })
  } catch (err) {
    console.error('metrics/monthly error', err)
    res.status(500).json({ error: String(err) })
  }
})

export default router
