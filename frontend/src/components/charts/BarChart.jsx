import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function BarChart({labels = [], data = [], title = ''}){
  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Dataset',
        data,
        backgroundColor: 'rgba(54,162,235,0.6)'
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
  }

  return (
    <div className="bg-white border rounded p-3">
      {title && <div className="text-sm font-medium mb-2">{title}</div>}
      <Bar data={chartData} options={options} />
    </div>
  )
}
