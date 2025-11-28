import axios from 'axios'
import API_BASE from './config'

export async function fetchYearlyMetrics(year) {
  const q = year ? `?year=${year}` : ''
  const res = await axios.get(`${API_BASE}/metrics/yearly${q}`)
  return res.data
}

export async function fetchMonthlyMetrics(year, month) {
  const res = await axios.get(`${API_BASE}/metrics/monthly?year=${year}&month=${month}`)
  return res.data
}


