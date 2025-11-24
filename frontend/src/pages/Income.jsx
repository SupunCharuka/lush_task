import React, {useEffect, useState} from 'react'
import {getIncome} from '../api/finance'

export default function Income(){
  const [items, setItems] = useState([])
  useEffect(()=>{ getIncome().then(setItems) },[])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Income Management</h2>
      <p className="mb-4 text-gray-600">Record project payments, invoices, customer deposits and other income sources.</p>

      <div className="bg-white border rounded p-4">
        <div className="overflow-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Date</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Source</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {items.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-sm">{r.date}</td>
                  <td className="px-3 py-2 text-sm">{r.source}</td>
                  <td className="px-3 py-2 text-sm">{`$${r.amount}`}</td>
                  <td className="px-3 py-2 text-sm">{r.notes}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">No income records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
