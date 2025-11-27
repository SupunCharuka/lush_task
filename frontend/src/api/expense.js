// frontend/src/api/expense.js
import axios from 'axios'
const API_BASE = 'http://localhost:5000/api'

export async function getExpenses(){
  const res = await axios.get(`${API_BASE}/expenses`)
  return res.data
}
export async function createExpense(payload){
  const res = await axios.post(`${API_BASE}/expenses`, payload)
  return res.data
}
export async function updateExpense(id, payload){
  const res = await axios.put(`${API_BASE}/expenses/${id}`, payload)
  return res.data
}
export async function deleteExpense(id){
  const res = await axios.delete(`${API_BASE}/expenses/${id}`)
  return res.data
}
export async function getMonthlyExpenseSummary(){
  const res = await axios.get(`${API_BASE}/expenses/monthly-summary`)
  return res.data
}
export default API_BASE