import React, {useEffect, useState} from 'react'
import ChartPlaceholder from '../components/ChartPlaceholder'
import TablePlaceholder from '../components/TablePlaceholder'
import {getSummary} from '../api/finance'

export default function Dashboard(){
  const [summary, setSummary] = useState(null)

  useEffect(()=>{
    getSummary().then(setSummary)
  },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Financial Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-4">
          <div className="flex gap-4">
            <div className="flex-1 p-3 border rounded">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-xl font-bold">{summary ? `$${summary.totalRevenue}` : '—'}</div>
            </div>
            <div className="flex-1 p-3 border rounded">
              <div className="text-sm text-gray-500">Monthly Profit/Loss</div>
              <div className="text-xl font-bold">{summary ? `$${summary.monthlyProfit}` : '—'}</div>
            </div>
          </div>
          <ChartPlaceholder title="Monthly Profit/Loss" />
        </div>
        <div className="grid gap-4">
          <ChartPlaceholder title="Expense Breakdown" height={300} />
          <div>
            <h3 className="mt-0">Recent Invoices</h3>
            <TablePlaceholder columns={["Invoice #","Customer","Amount","Status"]} rows={summary?.recentInvoices || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
