import React, { useEffect, useState } from 'react'
import { getCampaigns, getLeadsByPlatform, getMonthlyCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../api/campaign'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'


export default function Marketing() {

  const [campaigns, setCampaigns] = useState([])
  const [leadsByPlatform, setLeadsByPlatform] = useState([])
  const [monthly, setMonthly] = useState({ labels: [], leads: [], conversions: [], budgets: [] })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', platform: '', start: '', end: '', budget: 0, leads: 0, conversions: 0, revenue: 0 })
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')


  useEffect(() => {
    async function load() {
      try {
        const c = await getCampaigns()
        setCampaigns(c || [])
        const l = await getLeadsByPlatform()
        setLeadsByPlatform(l || [])
        const m = await getMonthlyCampaigns()

        setMonthly({ labels: m.labels || [], leads: m.leads || [], conversions: m.conversions || [], budgets: m.budgets || [] })
      } catch (err) {
        console.error('Failed to load marketing data', err)
      }
    }
    load()
  }, [])


  async function reloadCampaigns() {
    const items = await getCampaigns()
    setCampaigns(items || [])
  }


  function openCreate() {
    setEditing(null)
    setForm({ name: '', platform: '', start: '', end: '', budget: 0, leads: 0, conversions: 0, revenue: 0 })
    setShowForm(true)
  }


  function openEdit(campaign) {
    setEditing(campaign)
    setForm({
      name: campaign.name || '',
      platform: campaign.platform || '',
      start: campaign.start ? new Date(campaign.start).toISOString().slice(0, 10) : '',
      end: campaign.end ? new Date(campaign.end).toISOString().slice(0, 10) : '',
      budget: campaign.budget || 0,
      leads: campaign.leads || 0,
      conversions: campaign.conversions || 0,
      revenue: campaign.revenue || 0
    })
    setShowForm(true)
  }


  async function submitForm(e) {
    if (e) e.preventDefault()

    if (!form.name || !form.platform) return alert('Please enter a Name and Platform')
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
      const l = await getLeadsByPlatform()
      setLeadsByPlatform(l || [])
      const m = await getMonthlyCampaigns()
      setMonthly({ labels: m.labels || [], leads: m.leads || [], conversions: m.conversions || [], budgets: m.budgets || [] })
      setShowForm(false)
    } catch (err) {
      console.error(err)
      alert('Error saving campaign')
    } finally {
      setLoading(false)
    }
  }


  async function onDelete(id) {
    if (!window.confirm('Delete this campaign?')) return
    try {
      await deleteCampaign(id)

      setCampaigns(prev => prev.filter(c => c._id !== id))

      const l = await getLeadsByPlatform()
      setLeadsByPlatform(l || [])
      const m = await getMonthlyCampaigns()
      setMonthly({ labels: m.labels || [], leads: m.leads || [], conversions: m.conversions || [], budgets: m.budgets || [] })
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }


  function fmtCurrency(v) {
    if (v === null || typeof v === 'undefined' || isNaN(Number(v))) return '—'
    return `$${Number(v).toLocaleString()}`
  }

  function fmtDate(s) {
    if (!s) return '—'
    const d = new Date(s)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function formatPct(decimal) {
    if (typeof decimal !== 'number' || isNaN(decimal)) return '—'
    return `${(decimal * 100).toFixed(1)}%`
  }


  const totalLeads = campaigns.reduce((sum, item) => sum + (Number(item.leads) || 0), 0)
  const totalConversions = campaigns.reduce((sum, item) => sum + (Number(item.conversions) || 0), 0)
  const overallSuccessRate = totalLeads > 0 ? totalConversions / totalLeads : null


  const campaignCount = campaigns.length
  const totalBudget = campaigns.reduce((s, c) => s + (Number(c.budget) || 0), 0)
  const avgCPL = totalLeads > 0 ? totalBudget / totalLeads : null


  const successRates = (monthly.labels || []).map((_, i) => {
    const leads = Number(monthly.leads?.[i] || 0)
    const conv = Number(monthly.conversions?.[i] || 0)
    return leads > 0 ? (conv / leads) * 100 : null
  })

  const filteredCampaigns = (campaigns || []).filter(c => {
    const q = String(searchQuery || '').trim().toLowerCase()
    const nameAndPlatform = ((c.name || '') + ' ' + (c.platform || '')).toLowerCase()
    const matchesQuery = !q || nameAndPlatform.includes(q)
    const matchesPlatform = !platformFilter || (c.platform === platformFilter)
    return matchesQuery && matchesPlatform
  })

  return (
    <div className="max-w-7xl mx-auto p-4">


      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketing Overview</h1>
            <p className="text-indigo-100 mt-1">Campaign performance, leads and ROI at a glance.</p>
          </div>
          <div className="flex items-center">
            <button onClick={openCreate} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded">New Campaign</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Campaigns</div>
            <div className="text-xl font-semibold">{campaignCount}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Budget</div>
            <div className="text-xl font-semibold">{fmtCurrency(totalBudget)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Avg. CPL</div>
            <div className="text-xl font-semibold">{avgCPL ? fmtCurrency(avgCPL.toFixed(2)) : '—'}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Leads</div>
            <div className="text-xl font-semibold">{totalLeads}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Overall Success Rate</div>
            <div className="text-xl font-semibold">{overallSuccessRate !== null ? formatPct(overallSuccessRate) : '—'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="md:col-span-4">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium ">Campaigns</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <input
                  placeholder="Search campaigns"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="p-2 border rounded w-full sm:w-64"
                  aria-label="Search campaigns"
                />
                <select
                  className="p-2 border rounded w-full sm:w-48"
                  value={platformFilter}
                  onChange={e => setPlatformFilter(e.target.value)}
                  aria-label="Filter by platform"
                >
                  <option value="">All Platforms</option>
                  {[...new Set(campaigns.map(c => c.platform).filter(Boolean))].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
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
                  {filteredCampaigns.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-4 text-center text-sm text-gray-500">No campaigns</td></tr>
                  )}

                  {filteredCampaigns.map((campaign, i) => {

                    const leads = Number(campaign.leads) || 0
                    const conversions = Number(campaign.conversions) || 0
                    const budget = Number(campaign.budget) || 0
                    const cpl = leads > 0 ? budget / leads : null
                    const convRate = leads > 0 ? conversions / leads : null
                    const roi = (typeof campaign.revenue !== 'undefined' && budget > 0) ? (campaign.revenue - budget) / budget : null

                    return (
                      <tr key={campaign._id || i}>
                        <td className="px-3 py-2 text-sm">{campaign.name}</td>
                        <td className="px-3 py-2 text-sm">{campaign.platform}</td>
                        <td className="px-3 py-2 text-sm">{fmtDate(campaign.start)} → {fmtDate(campaign.end)}</td>
                        <td className="px-3 py-2 text-sm">{fmtCurrency(budget)}</td>
                        <td className="px-3 py-2 text-sm">{leads || '—'}</td>
                        <td className="px-3 py-2 text-sm">{conversions || '—'}</td>
                        <td className="px-3 py-2 text-sm">{cpl ? fmtCurrency(cpl.toFixed(2)) : '—'}</td>
                        <td className="px-3 py-2 text-sm">{convRate !== null ? formatPct(convRate) : '—'}</td>
                        <td className="px-3 py-2 text-sm">{roi !== null ? formatPct(roi) : '—'}</td>
                        <td className="px-3 py-2 text-sm">
                          <button onClick={() => openEdit(campaign)} className="text-sm text-blue-600 mr-2">Edit</button>
                          <button onClick={() => onDelete(campaign._id)} className="text-sm text-red-600">Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Monthly Campaigns (Leads)</h3>
          <BarChart labels={monthly.labels} data={monthly.leads} title="Leads per Month" />
          <div className="mt-4">
            <LineChart labels={monthly.labels} data={successRates} title="Monthly Success Rate" />
          </div>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Leads by Platform</h3>
          <PieChart
            labels={leadsByPlatform.map(l => l.platform)}
            data={leadsByPlatform.map(l => l.leads)}
            title="Leads by Platform"
          />
        </div>

      </div>
    </div>

  )
}