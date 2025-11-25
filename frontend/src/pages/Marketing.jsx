import React, {useEffect, useState} from 'react'
import {getCampaigns, getLeadsByPlatform, getMonthlyCampaigns} from '../api/finance'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'

export default function Marketing(){
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([])
  const [monthly, setMonthly] = useState({labels: [], leads: [], conversions: [], budgets: []})

  useEffect(()=>{
    getCampaigns().then(setCampaigns)
    getLeadsByPlatform().then(setLeads)
    // load monthly summary for charts
    getMonthlyCampaigns().then(setMonthly)
  },[])

  function fmtCurrency(v){ return `$${Number(v).toLocaleString()}` }

  function formatPct(v){ return `${(v*100).toFixed(1)}%` }

  function fmtDate(s){
    if(!s) return '—'
    const d = new Date(s)
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Marketing Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="bg-white border rounded p-4">
            <h3 className="mb-2 text-lg font-medium">Campaigns</h3>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {campaigns.map((campaign, i) => (
                      <tr key={i}>
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
                      </tr>
                  ))}
                    {campaigns.length === 0 && (
                      <tr><td colSpan={9} className="px-3 py-4 text-center text-sm text-gray-500">No campaigns</td></tr>
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
