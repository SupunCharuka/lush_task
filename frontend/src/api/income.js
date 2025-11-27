import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function getIncomes(){
  const res = await axios.get(`${API_BASE}/incomes`)
  return res.data
}

export async function createIncome(payload){
  const res = await axios.post(`${API_BASE}/incomes`, payload)
  return res.data
}

export async function updateIncome(id, payload){
  const res = await axios.put(`${API_BASE}/incomes/${id}`, payload)
  return res.data
}

export async function deleteIncome(id){
  const res = await axios.delete(`${API_BASE}/incomes/${id}`)
  return res.data
}

export async function getMonthlyIncomeSummary(){
  const res = await axios.get(`${API_BASE}/incomes/monthly-summary`)
  return res.data
}

export default API_BASE
