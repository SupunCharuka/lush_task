import React, { useEffect, useState } from 'react'
import { getCampaigns, getLeadsByPlatform, getMonthlyCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../api/campaign'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'

export default function Marketing() {
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([])
  const [monthly, setMonthly] = useState({ labels: [], leads: [], conversions: [], budgets: [] })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', platform: '', start: '', end: '', budget: 0, leads: 0, conversions: 0, revenue: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCampaigns().then(setCampaigns)
    getLeadsByPlatform().then(setLeads)
    getMonthlyCampaigns().then(setMonthly)
  }, [])

  async function reloadCampaigns() {
    const items = await getCampaigns()
    setCampaigns(items)
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: '', platform: '', start: '', end: '', budget: 0, leads: 0, conversions: 0, revenue: 0 })
    setShowForm(true)
  }

  function openEdit(c) {
    setEditing(c)
    setForm({
      name: c.name || '',
      platform: c.platform || '',
      start: c.start ? new Date(c.start).toISOString().slice(0, 10) : '',
      end: c.end ? new Date(c.end).toISOString().slice(0, 10) : '',
      budget: c.budget || 0,
      leads: c.leads || 0,
      conversions: c.conversions || 0,
      revenue: c.revenue || 0
    })
    setShowForm(true)
  }

  async function submitForm(e) {
    e && e.preventDefault()
    if (!form.name || !form.platform) return alert('Name and Platform required')
    setLoading(true)
    try {
      const payload = {
        ...form,
        start: form.start || undefined,
        end: form.end || undefined,
        budget: Number(form.budget),
        leads: Number(form.leads),
        conversions: Number(form.conversions),
        revenue: Number(form.revenue)
      }
      if (editing) {
        await updateCampaign(editing._id, payload)
      } else {
        await createCampaign(payload)
      }
      await reloadCampaigns()
      const newLeads = await getLeadsByPlatform()
      setLeads(newLeads)
      const newMonthly = await getMonthlyCampaigns()
      setMonthly(newMonthly)
      setShowForm(false)
    } catch (err) {
      console.error(err)
      alert('Error saving campaign')
    } finally {
      setLoading(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this campaign?')) return
    try {
      await deleteCampaign(id)
      setCampaigns(prev => prev.filter(c => c._id !== id))
      const newLeads = await getLeadsByPlatform()
      setLeads(newLeads)
      const newMonthly = await getMonthlyCampaigns()
      setMonthly(newMonthly)
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  function fmtCurrency(v) { return `$${Number(v).toLocaleString()}` }

  function formatPct(v) { return `${(v * 100).toFixed(1)}%` }

  function fmtDate(s) {
    if (!s) return '—'
    const d = new Date(s)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Marketing Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium">Campaigns</h3>
              <div>
                <button onClick={openCreate} className="bg-blue-600 text-white px-3 py-1 rounded">New Campaign</button>
              </div>
            </div>

            {showForm && (
              <form onSubmit={submitForm} className="bg-gray-50 border p-3 mb-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="p-2 border rounded" />
                  <input value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} placeholder="Platform" className="p-2 border rounded" />
                  <input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} className="p-2 border rounded" />
                  <input type="date" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} className="p-2 border rounded" />
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="Budget" className="p-2 border rounded" />
                  <input type="number" value={form.leads} onChange={e => setForm({ ...form, leads: e.target.value })} placeholder="Leads" className="p-2 border rounded" />
                  <input type="number" value={form.conversions} onChange={e => setForm({ ...form, conversions: e.target.value })} placeholder="Conversions" className="p-2 border rounded" />
                  <input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: e.target.value })} placeholder="Revenue" className="p-2 border rounded" />
                </div>
                <div className="mt-2">
                  <button type="submit" disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded mr-2">{editing ? 'Save' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1 rounded border">Cancel</button>
                </div>
              </form>
            )}
            <div className="overflow-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Platform</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Duration</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Budget</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Leads</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Conversions</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">CPL</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Conv. Rate</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">ROI</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {campaigns.map((campaign, i) => (
                    <tr key={campaign._id || i}>
                      <td className="px-3 py-2 text-sm">{campaign.name}</td>
                      <td className="px-3 py-2 text-sm">{campaign.platform}</td>
                      <td className="px-3 py-2 text-sm">{fmtDate(campaign.start)} → {fmtDate(campaign.end)}</td>
                      <td className="px-3 py-2 text-sm">{fmtCurrency(campaign.budget)}</td>
                      <td className="px-3 py-2 text-sm">{campaign.leads ?? '—'}</td>
                      <td className="px-3 py-2 text-sm">{campaign.conversions ?? '—'}</td>
                      <td className="px-3 py-2 text-sm">{campaign.leads ? fmtCurrency((campaign.budget / campaign.leads).toFixed(2)) : '—'}</td>
                      <td className="px-3 py-2 text-sm">{campaign.leads ? formatPct((campaign.conversions || 0) / campaign.leads) : '—'}</td>
                      <td className="px-3 py-2 text-sm">{
                        typeof campaign.revenue !== 'undefined' && campaign.budget ?
                          formatPct((campaign.revenue - campaign.budget) / campaign.budget) : '—'
                      }</td>
                      <td className="px-3 py-2 text-sm">
                        <button onClick={() => openEdit(campaign)} className="text-sm text-blue-600 mr-2">Edit</button>
                        <button onClick={() => onDelete(campaign._id)} className="text-sm text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-4 text-center text-sm text-gray-500">No campaigns</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded p-4">
            <h3 className="text-lg font-medium mb-2">Leads by Platform</h3>
            <PieChart
              labels={leads.map(l => l.platform)}
              data={leads.map(l => l.leads)}
              title="Leads by Platform"
            />
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="text-lg font-medium mb-2">Monthly Campaigns (Leads)</h3>
            <BarChart labels={monthly.labels} data={monthly.leads} title="Leads per Month" />
          </div>
        </div>
      </div>
    </div>
  )
}
