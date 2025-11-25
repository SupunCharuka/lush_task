import React, {useState} from 'react'

export default function Invoices(){
  // Static dummy invoices for development
  const [items] = useState([
    { id: 'INV-1001', customer: 'Acme Corp', amount: 1200, due: '2025-12-01', status: 'Paid' },
    { id: 'INV-1002', customer: 'Beta LLC', amount: 950, due: '2025-12-15', status: 'Pending' }
  ])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Invoice Management</h2>
      <p className="mb-4 text-gray-600">Create and send invoices; track statuses (Paid, Pending, Overdue).</p>
      <button className="mb-3 px-3 py-2 bg-blue-600 text-white rounded">Create Invoice</button>

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
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {items.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-sm">{r.id}</td>
                  <td className="px-3 py-2 text-sm">{r.customer}</td>
                  <td className="px-3 py-2 text-sm">{`$${r.amount}`}</td>
                  <td className="px-3 py-2 text-sm">{r.due}</td>
                  <td className="px-3 py-2 text-sm">{r.status}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">No invoices</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
