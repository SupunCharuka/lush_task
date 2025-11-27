import React from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function LineChart({ labels = [], data = [], title = '', tickSuffix = '' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Dataset',
        data,
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.2,
        fill: true,
        pointRadius: 3
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (val) {
              return `${val}${tickSuffix}`
            }
        }
      }
    }
  }

  return (
    <div className="bg-white border rounded p-3">
      {title && <div className="text-sm font-medium mb-2">{title}</div>}
      <Line data={chartData} options={options} />
    </div>
  )
}
