import React, {useEffect, useState} from 'react'
import {getCampaigns, getLeadsByPlatform} from '../api/finance'
import PieChart from '../components/charts/PieChart'

export default function Marketing(){
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([])

  useEffect(()=>{
    getCampaigns().then(setCampaigns)
    getLeadsByPlatform().then(setLeads)
  },[])

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
                    <th className="px-3 py-2 text-left text-sm text-gray-600">ROI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {campaigns.map((c, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-sm">{c.name}</td>
                      <td className="px-3 py-2 text-sm">{c.platform}</td>
                      <td className="px-3 py-2 text-sm">{c.duration}</td>
                      <td className="px-3 py-2 text-sm">{`$${c.budget}`}</td>
                      <td className="px-3 py-2 text-sm">{c.ROI}</td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr><td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">No campaigns</td></tr>
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
            <h3 className="text-lg font-medium mb-2">Monthly Campaigns</h3>
            <div className="text-gray-500">Placeholder for monthly campaigns chart</div>
          </div>
        </div>
      </div>
    </div>
  )
}
