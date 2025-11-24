import React, {useEffect, useState} from 'react'
import {getExpenses} from '../api/finance'

export default function Expenses(){
  const [items, setItems] = useState([])
  useEffect(()=>{ getExpenses().then(setItems) },[])

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Expense Management</h2>
      <p className="mb-4 text-gray-600">Track salaries, subscriptions, marketing expenses, utilities and other costs.</p>

      <div className="bg-white border rounded p-4">
        <div className="overflow-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Date</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Category</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {items.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-sm">{r.date}</td>
                  <td className="px-3 py-2 text-sm">{r.category}</td>
                  <td className="px-3 py-2 text-sm">{`$${r.amount}`}</td>
                  <td className="px-3 py-2 text-sm">{r.description}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">No expenses recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
