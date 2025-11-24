import React, {useEffect, useState} from 'react'
import TablePlaceholder from '../components/TablePlaceholder'
import {getIncome} from '../api/finance'

export default function Income(){
  const [items, setItems] = useState([])
  useEffect(()=>{ getIncome().then(setItems) },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Income Management</h2>
      <p className="mb-4 text-gray-600">Record project payments, invoices, customer deposits and other income sources.</p>
      <TablePlaceholder columns={["Date","Source","Amount","Notes"]} rows={items} />
    </div>
  )
}
