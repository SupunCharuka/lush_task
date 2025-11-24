import React, {useEffect, useState} from 'react'
import TablePlaceholder from '../components/TablePlaceholder'
import {getInvoices} from '../api/finance'

export default function Invoices(){
  const [items, setItems] = useState([])
  useEffect(()=>{ getInvoices().then(setItems) },[])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Invoice Management</h2>
      <p className="mb-4 text-gray-600">Create and send invoices; track statuses (Paid, Pending, Overdue).</p>
      <TablePlaceholder columns={["Invoice #","Customer","Amount","Due","Status"]} rows={items} />
    </div>
  )
}
