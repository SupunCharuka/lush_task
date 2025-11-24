import React, {useEffect, useState} from 'react'
import TablePlaceholder from '../components/TablePlaceholder'
import {getExpenses} from '../api/finance'

export default function Expenses(){
  const [items, setItems] = useState([])
  useEffect(()=>{ getExpenses().then(setItems) },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Expense Management</h2>
      <p className="mb-4 text-gray-600">Track salaries, subscriptions, marketing expenses, utilities and other costs.</p>
      <TablePlaceholder columns={["Date","Category","Amount","Description"]} rows={items} />
    </div>
  )
}
