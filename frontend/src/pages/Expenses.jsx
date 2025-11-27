import React, { useEffect, useState } from 'react'
import { getExpenses, createExpense, updateExpense, deleteExpense, getMonthlyExpenseSummary } from '../api/expense'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'
import StyledInput from '../components/inputs/StyledInput'
import StyledSelect from '../components/inputs/StyledSelect'

export default function Expenses() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // auto-clear visible error after a short timeout
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 6000)
    return () => clearTimeout(t)
  }, [error])

  const [form, setForm] = useState({ date: '', category: '', amount: '', description: '', vendor: '' })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [monthly, setMonthly] = useState({ labels: [], totals: [] })
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchItems()
    fetchSummary()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const data = await getExpenses()
      setItems(data || [])
    } catch (err) {
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSummary() {
    try {
      const s = await getMonthlyExpenseSummary()
      setMonthly({ labels: s.labels || [], totals: s.totals || [] })

      // build category breakdown from current items (simple client-side aggregation)
      // if API provides category summary, prefer that; otherwise compute from items after fetch
      // here we compute after fetching items
      const byCat = (await getExpenses() || []).reduce((acc, it) => {
        const k = it.category || 'Uncategorized'
        acc[k] = (acc[k] || 0) + (Number(it.amount) || 0)
        return acc
      }, {})
      setCategoryBreakdown(Object.keys(byCat).map(k => ({ category: k, total: byCat[k] })))
    } catch (err) {
      // ignore summary errors
    }
  }

  function resetForm() {
    setForm({ date: '', category: '', amount: '', description: '', vendor: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!form.category || !form.amount) {
      setError('Category and amount are required')
      return
    }
    const payload = { ...form, amount: Number(form.amount), date: form.date || new Date() }
    try {
      if (editingId) {
        await updateExpense(editingId, payload)
      } else {
        await createExpense(payload)
      }
      await fetchItems()
      await fetchSummary()
      resetForm()
      setError(null)
    } catch (err) {
      setError('Save failed')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) return
    try {
      await deleteExpense(id)
      setItems(prev => prev.filter(i => i._id !== id))
      await fetchSummary()
    } catch (err) {
      setError('Delete failed')
    }
  }

  function startEdit(item) {
    setEditingId(item._id)
    setForm({
      date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
      category: item.category || '',
      amount: item.amount || '',
      description: item.description || '',
      vendor: item.vendor || ''
    })
    setShowForm(true)
  }

  function fmtCurrency(v) {
    if (v === null || typeof v === 'undefined' || isNaN(Number(v))) return '—'
    return `$${Number(v).toLocaleString()}`
  }

  const totalExpenses = items.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const expenseCount = items.length
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0
  const uniqueCategories = [...new Set(items.map(i => i.category).filter(Boolean))]

  const filteredItems = items.filter(i => {
    const q = String(searchQuery || '').trim().toLowerCase()
    const matchesQuery = !q || ((i.description || '') + ' ' + (i.vendor || '') + ' ' + (i.category || '')).toLowerCase().includes(q)
    const matchesCategory = !categoryFilter || i.category === categoryFilter
    return matchesQuery && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto p-4">



      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-green-100 mt-1">Employee salaries, subscriptions, marketing costs, utilities and more.</p>
          </div>
          <div className="flex items-center">
            <button onClick={() => { setShowForm(true); setEditingId(null) }} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded">New Expense</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-green-100">Total Spent</div>
            <div className="text-xl font-semibold">{fmtCurrency(totalExpenses)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-green-100">Expenses</div>
            <div className="text-xl font-semibold">{expenseCount}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-green-100">Avg. Amount</div>
            <div className="text-xl font-semibold">{fmtCurrency(avgExpense.toFixed ? avgExpense.toFixed(2) : avgExpense)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-green-100">Categories</div>
            <div className="text-xl font-semibold">{uniqueCategories.length}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-green-100">Top Vendor</div>
            <div className="text-xl font-semibold">{items.length ? (items.reduce((acc, it) => { acc[it.vendor] = (acc[it.vendor] || 0) + (Number(it.amount) || 0); return acc }, {}), Object.entries(items.reduce((acc, it) => { acc[it.vendor] = (acc[it.vendor] || 0) + (Number(it.amount) || 0); return acc }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || '—') : '—'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="md:col-span-4">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium ">Expenses</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <StyledInput
                    label="Search"
                    placeholder="Search expenses"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label="Search expenses"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <StyledSelect
                    label="Category"
                    options={[...new Set(items.map(c => c.category).filter(Boolean))]}
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                  />
                </div>
              </div>
            </div>


            {showForm && (
              <form onSubmit={handleSubmit} className="bg-gray-50 border p-3 mb-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <StyledInput
                    label="Date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                  <StyledInput
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Salaries, Tools, Marketing..."
                  />
                  <StyledInput
                    label="Amount"
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                  />
                  <StyledInput
                    label="Vendor"
                    name="vendor"
                    value={form.vendor}
                    onChange={handleChange}
                  />
                  <div />
                </div>
                <div className="mt-3">
                  <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded mr-2">{editingId ? 'Save' : 'Create'}</button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="px-3 py-1 rounded border">Cancel</button>
                </div>
                {/* Dismissible error banner shown site-wide on this page */}
                {error && (
                  <div className="mb-4 mt-2 p-3 rounded bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
                    <div className="text-sm">{error}</div>
                    <button onClick={() => setError(null)} className="ml-4 text-sm font-medium underline">Dismiss</button>
                  </div>
                )}
              </form>
            )}


            <div className="overflow-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Date</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Category</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Vendor</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Description</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">No expenses recorded</td></tr>
                  )}

                  {filteredItems.map((item) => (

                    <tr key={item._id}>
                      <td className="px-3 py-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-sm">{item.category}</td>
                      <td className="px-3 py-2 text-sm">{fmtCurrency(item.amount)}</td>
                      <td className="px-3 py-2 text-sm">{item.vendor}</td>
                      <td className="px-3 py-2 text-sm">{item.description}</td>
                      <td className="px-3 py-2 text-sm">
                        <button onClick={() => startEdit(item)} className="text-sm text-blue-600 mr-2">Edit</button>
                        <button onClick={() => handleDelete(item._id)} className="text-sm text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Monthly Expenses</h3>
          <BarChart labels={monthly.labels} data={monthly.totals} title="Expenses per Month" />
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">By Category</h3>
          <PieChart labels={categoryBreakdown.map(c => c.category)} data={categoryBreakdown.map(c => c.total)} title="Expenses by Category" />
        </div>

      </div>
    </div>
  )
}