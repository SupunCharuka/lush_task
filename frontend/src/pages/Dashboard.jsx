import React, {useEffect, useState} from 'react'
import {getSummary, getMonthlyStats, getExpenseBreakdown} from '../api/finance'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'

export default function Dashboard(){
  const [summary, setSummary] = useState(null)

  useEffect(()=>{
    getSummary().then(setSummary)
  },[])

  const [monthly, setMonthly] = useState({labels: [], data: []})
  const [expenseBreakdown, setExpenseBreakdown] = useState([])

  useEffect(()=>{
    getMonthlyStats().then(setMonthly)
    getExpenseBreakdown().then(setExpenseBreakdown)
  },[])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Financial Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-xl font-bold">{summary ? `$${summary.totalRevenue}` : '—'}</div>
            </div>
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-500">Monthly Profit/Loss</div>
              <div className="text-xl font-bold">{summary ? `$${summary.monthlyProfit}` : '—'}</div>
            </div>
          </div>

          <BarChart labels={monthly.labels} data={monthly.data} title="Monthly Profit/Loss" />
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded p-4">
            <h3 className="text-lg font-medium mb-2">Expense Breakdown</h3>
            <PieChart
              labels={expenseBreakdown.map(e => e.category)}
              data={expenseBreakdown.map(e => e.amount)}
              title="Expense Breakdown"
            />
          </div>

          <div className="bg-white border rounded p-4">
            <h3 className="text-lg font-medium mb-2">Recent Invoices</h3>
            <div className="overflow-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Invoice #</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Customer</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {(summary?.recentInvoices || []).map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-sm">{row[0]}</td>
                      <td className="px-3 py-2 text-sm">{row[1]}</td>
                      <td className="px-3 py-2 text-sm">{row[2]}</td>
                      <td className="px-3 py-2 text-sm">{row[3]}</td>
                    </tr>
                  ))}
                  {(!summary || summary.recentInvoices?.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">No recent invoices</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
