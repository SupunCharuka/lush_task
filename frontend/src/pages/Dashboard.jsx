import React, { useEffect, useState } from 'react'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'
import LineChart from '../components/charts/LineChart'
import { fetchYearlyMetrics } from '../api/metrics'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchYearlyMetrics(new Date().getFullYear())
      .then((d) => {
        if (!mounted) return
        setMetrics(d)
        setError(null)
      })
      .catch((e) => {
        console.error(e)
        if (!mounted) return
        setError(String(e))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const profitByMonth = metrics ? metrics.incomesByMonth.map((inc, i) => inc - (metrics.expensesByMonth[i] || 0)) : []
  const profitColors = profitByMonth.map(v => v >= 0 ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.85)')

  function fmtCurrency(v){
    if (v === null || typeof v === 'undefined' || isNaN(Number(v))) return '—'
    return `$${Number(v).toLocaleString()}`
  }

  return (
    <div className="max-w-7xl mx-auto p-4">

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Financial Overview</h1>
            <p className="text-indigo-100 mt-1">Monthly profit & loss, revenue, and expense breakdown.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Revenue</div>
            <div className="text-xl font-semibold">{metrics ? fmtCurrency(metrics.totalRevenue) : '—'}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Expense</div>
            <div className="text-xl font-semibold">{metrics ? fmtCurrency(metrics.totalExpense) : '—'}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Profit / Loss</div>
            <div className="text-xl font-semibold" style={{ color: metrics?.profit >= 0 ? '#10b981' : '#ef4444' }}>{metrics ? fmtCurrency(metrics.profit) : '—'}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Months Shown</div>
            <div className="text-xl font-semibold">12</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Last Updated</div>
            <div className="text-xl font-semibold">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {loading && <div>Loading metrics…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <div className="md:col-span-3">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium">Monthly Profit / Loss</h3>
            </div>

            <BarChart labels={MONTH_LABELS} data={profitByMonth} title="Monthly Profit (Revenue - Expense)" backgroundColors={profitColors} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border rounded p-4">
            <h3 className="text-lg font-medium mb-2">Expense Breakdown</h3>
            <PieChart
              labels={metrics ? metrics.expenseBreakdown.map(e => e.category) : []}
              data={metrics ? metrics.expenseBreakdown.map(e => e.total) : []}
              title="Expense Breakdown"
            />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Profit Trend</h3>
          <LineChart labels={MONTH_LABELS} data={profitByMonth} title="Profit Trend" />
        </div>

       
      </div>

    </div>
  )
}
