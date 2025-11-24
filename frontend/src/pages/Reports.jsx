import React from 'react'
import ChartPlaceholder from '../components/ChartPlaceholder'

export default function Reports(){
  const onExportPDF = ()=>{
    alert('Export PDF - integrate jsPDF or server-side generation')
  }
  const onExportExcel = ()=>{
    alert('Export Excel - integrate xlsx library')
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Analytics & Reports</h2>
      <p className="mb-4 text-gray-600">Downloadable reports for income statements, expense statements and profit/loss summaries.</p>
      <div className="mb-3">
        <button onClick={onExportPDF} className="mr-2 px-3 py-2 bg-blue-600 text-white rounded">Export PDF</button>
        <button onClick={onExportExcel} className="px-3 py-2 bg-green-600 text-white rounded">Export Excel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Income Statement</h3>
          <ChartPlaceholder title="Income Statement" />
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-medium mb-2">Expense Statement</h3>
          <ChartPlaceholder title="Expense Statement" />
        </div>
      </div>
    </div>
  )
}
