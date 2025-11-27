import React, { useEffect, useState } from 'react'
import { getInvoices, createInvoice, sendInvoice, updateInvoice, deleteInvoice } from '../api/invoice'

function formatCurrency(v) {
  return `$${Number(v || 0).toFixed(2)}`
}

export default function Invoices() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ invoiceNumber: '', customerName: '', dueDate: '', templateName: 'Standard', items: [{ description: '', quantity: 1, price: 0 }], notes: '', taxPercent: 0, discount: 0 })
  const [editingId, setEditingId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getInvoices()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function updateItemField(idx, key, value) {
    const copy = JSON.parse(JSON.stringify(form))
    copy.items[idx][key] = key === 'quantity' || key === 'price' ? Number(value) : value
    setForm(copy)
  }

  function addItemRow() {
    setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, price: 0 }] }))
  }

  function removeItemRow(idx) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  function computeTotal() {
    const subtotal = form.items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.price || 0)), 0)
    const taxAmount = subtotal * (Number(form.taxPercent || 0) / 100)
    const discount = Number(form.discount || 0)
    return subtotal + taxAmount - discount
  }

  function computeBreakdown() {
    const subtotal = form.items.reduce((s, it) => s + (Number(it.quantity || 0) * Number(it.price || 0)), 0)
    const taxAmount = subtotal * (Number(form.taxPercent || 0) / 100)
    const discount = Number(form.discount || 0)
    const total = subtotal + taxAmount - discount
    return { subtotal, taxAmount, discount, total }
  }

  async function handleCreate(e) {
    e?.preventDefault()
    const payload = { ...form, total: computeTotal() }
    if (!payload.invoiceNumber) delete payload.invoiceNumber
    try {
      if (editingId) {
        // update
        await updateInvoice(editingId, payload)
      } else {
        await createInvoice(payload)
      }
      setShowForm(false)
      setForm({ invoiceNumber: '', customerName: '', dueDate: '', templateName: 'Standard', items: [{ description: '', quantity: 1, price: 0 }], notes: '', taxPercent: 0, discount: 0 })
      setEditingId(null)
      await load()
    } catch (err) {
      console.error(err)
      alert('Failed to create invoice')
    }
  }

  function openEdit(invoice) {
    
    const prepared = {
      invoiceNumber: invoice.invoiceNumber || '',
      customerName: invoice.customerName || '',
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '',
      templateName: invoice.templateName || 'Standard',
      items: (invoice.items && invoice.items.length) ? invoice.items.map(i => ({ description: i.description || '', quantity: i.quantity || 1, price: i.price || 0 })) : [{ description: '', quantity: 1, price: 0 }],
      notes: invoice.notes || '',
      taxPercent: invoice.taxPercent || 0,
      discount: invoice.discount || 0
    }

    setForm(prepared)
    setEditingId(invoice._id)
    setShowForm(true)
  }

  async function handleSend(id) {
    try {
      await sendInvoice(id)
      await load()
      alert('Invoice sent (simulated)')
    } catch (err) { console.error(err); alert('Failed to send') }
  }

  async function handleMarkPaid(id) {
    try {
      await updateInvoice(id, { status: 'Paid' })
      await load()
    } catch (e) { console.error(e) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this invoice?')) return
    try {
      await deleteInvoice(id)
      await load()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Invoice Management</h2>
      <p className="mb-4 text-gray-600">Create and send invoices; track statuses (Paid, Pending, Overdue).</p>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setShowForm(true)} className="px-3 py-2 bg-blue-600 text-white rounded">Create Invoice</button>
        <div className="text-sm text-gray-600">{loading ? 'Loading...' : `${items.length} invoices`}</div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600">Invoice #</label>
              <input value={form.invoiceNumber || ''} placeholder="Auto-generated on save" className="w-full border px-2 py-1 bg-gray-100" disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Customer</label>
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} className="w-full border px-2 py-1" required />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Template</label>
              <select value={form.templateName} onChange={e => setForm(f => ({ ...f, templateName: e.target.value }))} className="w-full border px-2 py-1">
                <option>Standard</option>
                <option>Professional</option>
                <option>Minimal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600">Tax (%)</label>
              <input type="number" value={form.taxPercent} onChange={e => setForm(f => ({ ...f, taxPercent: Number(e.target.value) }))} className="w-full border px-2 py-1" step="0.01" />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Discount (amount)</label>
              <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))} className="w-full border px-2 py-1" step="0.01" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Items</div>
            {form.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
                <input className="col-span-6 border px-2 py-1" placeholder="Description" value={it.description} onChange={e => updateItemField(idx, 'description', e.target.value)} required />
                <input type="number" className="col-span-2 border px-2 py-1" value={it.quantity} onChange={e => updateItemField(idx, 'quantity', e.target.value)} min={1} />
                <input type="number" className="col-span-2 border px-2 py-1" value={it.price} onChange={e => updateItemField(idx, 'price', e.target.value)} step="0.01" />
                <div className="col-span-1 text-sm">{formatCurrency(it.quantity * it.price)}</div>
                <button type="button" onClick={() => removeItemRow(idx)} className="col-span-1 text-red-600">✕</button>
              </div>
            ))}
            <div>
              <button type="button" onClick={addItemRow} className="px-2 py-1 text-sm border rounded">Add item</button>
            </div>
          </div>

          <div className="mt-3">
           
            <div className="text-xs text-gray-600 mt-1">
              {(() => { const b = computeBreakdown(); return (
                <div>
                  <div>Subtotal: {formatCurrency(b.subtotal)}</div>
                  <div>Tax ({form.taxPercent}%): {formatCurrency(b.taxAmount)}</div>
                  <div>Discount: {formatCurrency(b.discount)}</div>
                </div>
              ) })()}
            </div>
             <div className="text-sm text-gray-700 mt-2">Total: <strong>{formatCurrency(computeTotal())}</strong></div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ invoiceNumber: '', customerName: '', dueDate: '', templateName: 'Standard', items: [{ description: '', quantity: 1, price: 0 }], notes: '', taxPercent: 0, discount: 0 }) }} className="px-3 py-1 border rounded">Cancel</button>
              <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white border rounded p-4">
        <div className="overflow-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Invoice #</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Customer</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Due</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="px-3 py-2 text-sm">{item.invoiceNumber}</td>
                  <td className="px-3 py-2 text-sm">{item.customerName}</td>
                  <td className="px-3 py-2 text-sm">{formatCurrency(item.total)}</td>
                  <td className="px-3 py-2 text-sm">{item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '-'}</td>
                  <td className="px-3 py-2 text-sm">{item.status}{item.sentAt ? ' • Sent' : ''}</td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleSend(item._id)} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Send</button>
                      <button onClick={() => openEdit(item)} className="px-2 py-1 bg-yellow-400 text-black rounded text-xs">Edit</button>
                      <button onClick={() => handleMarkPaid(item._id)} className="px-2 py-1 bg-gray-200 rounded text-xs">Mark Paid</button>
                      <button onClick={() => handleDelete(item._id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">No invoices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
