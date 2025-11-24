import React from 'react'

export default function ChartPlaceholder({title, height=220}){
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-3" style={{height}}>
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-gray-500">Chart placeholder — integrate Chart.js or Recharts here.</div>
    </div>
  )
}
