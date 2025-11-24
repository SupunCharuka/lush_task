import React, {useEffect, useState} from 'react'
import ChartPlaceholder from '../components/ChartPlaceholder'
import TablePlaceholder from '../components/TablePlaceholder'
import {getCampaigns, getLeadsByPlatform} from '../api/finance'

export default function Marketing(){
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([])

  useEffect(()=>{
    getCampaigns().then(setCampaigns)
    getLeadsByPlatform().then(setLeads)
  },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Marketing Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <h3 className="mb-2">Campaigns</h3>
          <TablePlaceholder columns={["Name","Platform","Duration","Budget","ROI"]} rows={campaigns} />
        </div>
        <div className="grid gap-4">
          <ChartPlaceholder title="Leads by Platform" />
          <ChartPlaceholder title="Monthly Campaigns" />
        </div>
      </div>
    </div>
  )
}
