import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function fetchYearlyMetrics(year) {
  const q = year ? `?year=${year}` : ''
  const res = await axios.get(`${API_BASE}/metrics/yearly${q}`)
  return res.data
}

export async function fetchMonthlyMetrics(year, month) {
  const res = await axios.get(`${API_BASE}/metrics/monthly?year=${year}&month=${month}`)
  return res.data
}

export default API_BASE
