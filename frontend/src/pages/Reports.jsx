import React, { useEffect, useMemo, useState } from 'react'
import ChartPlaceholder from '../components/ChartPlaceholder'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import StyledInput from '../components/inputs/StyledInput'
import StyledSelect from '../components/inputs/StyledSelect'

export default function Reports() {
  const [type, setType] = useState('income')
  const [format, setFormat] = useState('pdf')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  useEffect(() => {
    // fetch both lists once
    const fetchData = async () => {
      setLoading(true)
      try {
        const [incResp, expResp] = await Promise.all([
          fetch(`${apiBase}/api/incomes`).then(r => r.json()),
          fetch(`${apiBase}/api/expenses`).then(r => r.json())
        ])
        setIncomes(Array.isArray(incResp) ? incResp : [])
        setExpenses(Array.isArray(expResp) ? expResp : [])
        // fetch monthly summaries for charts
        try {
          const [incSum, expSum] = await Promise.all([
            fetch(`${apiBase}/api/incomes/monthly-summary`).then(r => r.json()),
            fetch(`${apiBase}/api/expenses/monthly-summary`).then(r => r.json())
          ])
          setIncomeSummary(incSum)
          setExpenseSummary(expSum)
        } catch (e) {
          // non-fatal
          console.debug('Failed to load monthly summaries', e)
        }
      } catch (e) {
        console.error(e)
        setError('Failed to load data')
      } finally { setLoading(false) }
    }
    fetchData()
  }, [apiBase])

  const totals = useMemo(() => {
    const filterByDate = (items) => {
      if (!from && !to) return items
      return items.filter(it => {
        const d = new Date(it.date)
        if (from && d < new Date(from)) return false
        if (to && d > new Date(to)) return false
        return true
      })
    }
    const inc = filterByDate(incomes).reduce((s, i) => s + (i.amount || 0), 0)
    const exp = filterByDate(expenses).reduce((s, e) => s + (e.amount || 0), 0)
    return { income: inc, expense: exp, net: inc - exp }
  }, [incomes, expenses, from, to])

  const previewItems = useMemo(() => {
    const items = type === 'income' ? incomes : expenses
    // filter by date range then sort desc
    return items.filter(it => {
      if (!from && !to) return true
      const d = new Date(it.date)
      if (from && d < new Date(from)) return false
      if (to && d > new Date(to)) return false
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
  }, [type, incomes, expenses, from, to])

  const [incomeSummary, setIncomeSummary] = useState({ labels: [], totals: [] })
  const [expenseSummary, setExpenseSummary] = useState({ labels: [], totals: [] })

  const doExport = async () => {
    try {
      const params = new URLSearchParams({ type, format })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const resp = await fetch(`${apiBase}/api/reports/export?${params.toString()}`)
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || 'Export failed')
      }
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      a.href = url
      a.download = `${type}-statement-${from || 'all'}-${to || 'all'}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Export failed. See console for details.')
    }
  }

  const applyPreset = (preset) => {
    const now = new Date()
    if (preset === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      setFrom(start); setTo('')
    } else if (preset === 'ytd') {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10)
      setFrom(start); setTo('')
    } else if (preset === 'last-30') {
      const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
      setFrom(start); setTo('')
    } else if (preset === 'all') {
      setFrom(''); setTo('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <p className="text-indigo-100 mt-1">Download income/expense statements and view quick summaries.</p>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Income</div>
            <div className="text-xl font-semibold">${totals.income.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Expense</div>
            <div className="text-xl font-semibold">${totals.expense.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Net</div>
            <div className="text-xl font-semibold">${totals.net.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Preview Items</div>
            <div className="text-xl font-semibold">{previewItems.length}</div>
          </div>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Trends</h3>
            <div className="text-sm text-gray-500">Preview charts</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-2 bg-gray-50 rounded">
              {incomeSummary && incomeSummary.labels && incomeSummary.labels.length > 0 ? (
                <LineChart labels={incomeSummary.labels} data={incomeSummary.totals} title="Income (monthly)" tickSuffix="" />
              ) : (
                <ChartPlaceholder title="Income (monthly)" />
              )}
            </div>
            <div className="p-2 bg-gray-50 rounded">
              {expenseSummary && expenseSummary.labels && expenseSummary.labels.length > 0 ? (
                <BarChart labels={expenseSummary.labels} data={expenseSummary.totals} title="Expense (monthly)" />
              ) : (
                <ChartPlaceholder title="Expense (monthly)" />
              )}
            </div>
          </div>
        </div>

        <aside className="bg-white border rounded p-4">
          <h4 className="font-medium mb-3">Export</h4>
          <div className="mb-3">
            <StyledSelect
              label="Type"
              options={["income", "expense"]}
              value={type}
              onChange={e => setType(e.target ? e.target.value : e)}
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <StyledInput
                label="From"
                type="date"
                value={from}
                onChange={e => setFrom(e.target ? e.target.value : e)}
              />
            </div>
            <div>
              <StyledInput
                label="To"
                type="date"
                value={to}
                onChange={e => setTo(e.target ? e.target.value : e)}
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-2">Presets</div>
            <div className="flex gap-2">
              <button onClick={() => applyPreset('this-month')} className="px-2 py-1 bg-gray-100 rounded text-sm">This month</button>
              <button onClick={() => applyPreset('last-30')} className="px-2 py-1 bg-gray-100 rounded text-sm">Last 30d</button>
              <button onClick={() => applyPreset('ytd')} className="px-2 py-1 bg-gray-100 rounded text-sm">YTD</button>
              <button onClick={() => applyPreset('all')} className="px-2 py-1 bg-gray-100 rounded text-sm">All</button>
            </div>
          </div>

          <div className="mb-4">
            <StyledSelect
              label="Format"
              options={["pdf", "excel"]}
              value={format}
              onChange={e => setFormat(e.target ? e.target.value : e)}
            />
          </div>

          <button onClick={doExport} className="w-full px-3 py-2 bg-blue-600 text-white rounded">Download {format.toUpperCase()}</button>
        </aside>
      </section>

      <section className="bg-white border rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Recent {type === 'income' ? 'Incomes' : 'Expenses'}</h3>

        </div>

        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600 border-b">
                <th className="p-2">Date</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {previewItems.map(it => (
                <tr key={it._id} className="border-b">
                  <td className="p-2 align-top text-sm">{new Date(it.date).toLocaleDateString()}</td>
                  <td className={`p-2 align-top text-sm text-right ${type === 'expense' ? 'text-red-600' : 'text-green-700'}`}>${(it.amount || 0).toFixed(2)}</td>
                </tr>
              ))}
              {previewItems.length === 0 && (
                <tr><td colSpan={2} className="p-4 text-sm text-gray-500">No items in the selected range.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
