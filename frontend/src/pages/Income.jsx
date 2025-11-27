import React, { useEffect, useState } from 'react'
import { getIncomes, createIncome, updateIncome, deleteIncome, getMonthlyIncomeSummary } from '../api/income'
import BarChart from '../components/charts/BarChart'
import StyledInput from '../components/inputs/StyledInput'
import StyledSelect from '../components/inputs/StyledSelect'

export default function Income() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ type: 'payment', date: '', source: '', amount: '', invoiceNumber: '', notes: '' })
  const [summary, setSummary] = useState({ labels: [], totals: [] })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ type: '', date: '', customer: '', amount: '', invoiceNumber: '', notes: '', status: '' })
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await getIncomes()
        setItems(data)
        const s = await getMonthlyIncomeSummary()
        setSummary({ labels: s.labels || [], totals: s.totals || [] })
      } catch (err) {
        console.error('Failed to load incomes', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      type: form.type,
      date: form.date ? new Date(form.date) : new Date(),
      customer: form.source,
      amount: Number(form.amount) || 0,
      invoiceNumber: form.invoiceNumber,
      notes: form.notes
    }

    try {
      const created = await createIncome(payload)
      setItems(prev => [created, ...prev])
      // refresh monthly summary after create
      try {
        const s = await getMonthlyIncomeSummary()
        setSummary({ labels: s.labels || [], totals: s.totals || [] })
      } catch (err) { /* ignore summary refresh errors */ }
      setForm({ type: 'payment', date: '', source: '', amount: '', invoiceNumber: '', notes: '' })
      setShowForm(false)
    } catch (err) {
      console.error('Failed to create income', err)
      alert('Failed to add income')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this income record?')) return
    try {
      await deleteIncome(id)
      setItems(prev => prev.filter(i => i._id !== id))
      // refresh monthly summary after delete
      try {
        const s = await getMonthlyIncomeSummary()
        setSummary({ labels: s.labels || [], totals: s.totals || [] })
      } catch (err) { }
    } catch (err) {
      console.error('Failed to delete', err)
      alert('Failed to delete income')
    }
  }

  async function handleTogglePaid(id) {
    try {
      const item = items.find(i => i._id === id)
      const newStatus = item && item.status === 'paid' ? 'pending' : 'paid'
      const updated = await updateIncome(id, { status: newStatus })
      setItems(prev => prev.map(p => p._id === id ? updated : p))

      try {
        const s = await getMonthlyIncomeSummary()
        setSummary({ labels: s.labels || [], totals: s.totals || [] })
      } catch (err) { }
    } catch (err) {
      console.error('Failed to update', err)
      alert('Failed to update income')
    }
  }

  // Edit helpers
  function startEdit(item) {
    setEditingId(item._id)
    setEditForm({
      type: item.type || 'payment',
      date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
      customer: item.customer || '',
      amount: item.amount || '',
      invoiceNumber: item.invoiceNumber || '',
      notes: item.notes || '',
      status: item.status || 'paid'
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ type: '', date: '', customer: '', amount: '', invoiceNumber: '', notes: '', status: '' })
  }

  async function saveEdit(id) {
    try {
      const payload = {
        type: editForm.type,
        date: editForm.date ? new Date(editForm.date) : undefined,
        customer: editForm.customer,
        amount: Number(editForm.amount) || 0,
        invoiceNumber: editForm.invoiceNumber,
        notes: editForm.notes,
        status: editForm.status
      }
      const updated = await updateIncome(id, payload)
      setItems(prev => prev.map(p => p._id === id ? updated : p))
      setEditingId(null)
      // refresh summary
      try {
        const s = await getMonthlyIncomeSummary()
        setSummary({ labels: s.labels || [], totals: s.totals || [] })
      } catch (err) { }
    } catch (err) {
      console.error('Failed to save edit', err)
      alert('Failed to save changes')
    }
  }

  const totalIncome = items.reduce((s, it) => s + (Number(it.amount) || 0), 0)
  const incomeCount = items.length
  const avgAmount = incomeCount > 0 ? totalIncome / incomeCount : 0
  const pendingAmount = items.reduce((s, it) => s + ((it.status === 'pending') ? (Number(it.amount) || 0) : 0), 0)
  const lastMonthIncome = (summary.totals && summary.totals.length) ? summary.totals[summary.totals.length - 1] : 0

  function openCreate() {
    setShowForm(true)
    setForm({ type: 'payment', date: '', source: '', amount: '', invoiceNumber: '', notes: '' })
  }

  const customerOptions = [...new Set(items.map(i => i.customer).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Income Management</h1>
            <p className="text-indigo-100 mt-1">Project payments, invoices, deposits and ad-hoc income entries.</p>
          </div>
          <div className="flex items-center">
            <button onClick={openCreate} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded">New Income</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Income</div>
            <div className="text-xl font-semibold">{`$${Number(totalIncome || 0).toLocaleString()}`}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Records</div>
            <div className="text-xl font-semibold">{incomeCount}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Avg. Amount</div>
            <div className="text-xl font-semibold">{avgAmount ? `$${Number(avgAmount).toFixed(2)}` : '—'}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Pending</div>
            <div className="text-xl font-semibold">{`$${Number(pendingAmount || 0).toLocaleString()}`}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Last Month</div>
            <div className="text-xl font-semibold">{lastMonthIncome ? `$${Number(lastMonthIncome).toLocaleString()}` : '—'}</div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium">Incomes</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <StyledInput label="Search" placeholder="Search incomes" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="w-full sm:w-48">
                  <StyledSelect label="Customer" options={customerOptions} value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} />
                </div>
                <div>
                  <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-3 py-1 rounded">{showForm ? 'Close' : 'New'}</button>
                </div>
              </div>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-gray-50 border p-3 mb-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <StyledSelect label="Type" options={['payment', 'invoice', 'deposit', 'ad-hoc']} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
                  <StyledInput label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  <StyledInput label="Customer" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Customer name" />
                  <StyledInput label="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
                  <StyledInput label="Invoice #" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} />
                  <StyledInput label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Create</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 rounded border">Cancel</button>
                </div>
              </form>
            )}
            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Date</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Type</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Source</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Notes</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                      <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {(() => {
                      const q = String(searchQuery || '').trim().toLowerCase()
                      const filtered = items.filter(it => {
                        const matchesQuery = !q || ((it.customer || '') + ' ' + (it.notes || '') + ' ' + (it.invoiceNumber || '')).toLowerCase().includes(q)
                        const matchesCustomer = !customerFilter || (it.customer === customerFilter)
                        return matchesQuery && matchesCustomer
                      })
                      if (filtered.length === 0) return (
                        <tr><td colSpan={7} className="px-3 py-4 text-center text-sm text-gray-500">No income records</td></tr>
                      )
                      return filtered.map((item) => (
                        <tr key={item._id}>
                          {editingId === item._id ? (
                            <>
                              <td className="px-3 py-2 text-sm">
                                <input type="date" className="border p-1" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <select className="border p-1" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                                  <option value="payment">Payment</option>
                                  <option value="invoice">Invoice</option>
                                  <option value="deposit">Deposit</option>
                                  <option value="ad-hoc">Ad-hoc</option>
                                </select>
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <input className="border p-1" value={editForm.customer} onChange={e => setEditForm({ ...editForm, customer: e.target.value })} />
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <input className="border p-1" type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <input className="border p-1" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <select className="border p-1" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                  <option value="paid">Paid</option>
                                  <option value="pending">Pending</option>
                                  <option value="refunded">Refunded</option>
                                </select>
                              </td>
                              <td className="px-3 py-2 text-sm">
                                <button className="text-sm text-green-600 mr-2" onClick={() => saveEdit(item._id)}>Save</button>
                                <button className="text-sm text-gray-600" onClick={cancelEdit}>Cancel</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                              <td className="px-3 py-2 text-sm">{item.type}</td>
                              <td className="px-3 py-2 text-sm">{item.customer}</td>
                              <td className="px-3 py-2 text-sm">{`$${item.amount}`}</td>
                              <td className="px-3 py-2 text-sm">{item.notes}</td>
                              <td className="px-3 py-2 text-sm">{item.status}</td>
                              <td className="px-3 py-2 text-sm">
                                <button className="text-sm text-blue-600 mr-2" onClick={() => handleTogglePaid(item._id)}>{item.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}</button>
                                <button className="text-sm text-indigo-600 mr-2" onClick={() => startEdit(item)}>Edit</button>
                                <button className="text-sm text-red-600" onClick={() => handleDelete(item._id)}>Delete</button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Monthly Income</h3>
          <BarChart labels={summary.labels} data={summary.totals} title=" " />
        </div>
      </div>
    </div>
  )
}
