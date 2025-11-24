import React from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PieChart({labels = [], data = [], title = ''}){
  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: [
        '#3b82f6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'
      ]
    }]
  }

  const options = { responsive: true }

  return (
    <div className="bg-white border rounded p-3">
      {title && <div className="text-sm font-medium mb-2">{title}</div>}
      <Pie data={chartData} options={options} />
    </div>
  )
}
