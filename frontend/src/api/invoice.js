import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function getInvoices(){
  const res = await axios.get(`${API_BASE}/invoices`)
  return res.data
}

export async function createInvoice(payload){
  const res = await axios.post(`${API_BASE}/invoices`, payload)
  return res.data
}

export async function updateInvoice(id, payload){
  const res = await axios.put(`${API_BASE}/invoices/${id}`, payload)
  return res.data
}

export async function deleteInvoice(id){
  const res = await axios.delete(`${API_BASE}/invoices/${id}`)
  return res.data
}

export async function sendInvoice(id, payload){
  const res = await axios.post(`${API_BASE}/invoices/${id}/send`, payload)
  return res.data
}

export async function downloadInvoicePDF(id) {
  const res = await axios.get(`${API_BASE}/invoices/${id}/pdf`, { responseType: 'blob' });
  return res.data; // blob
}

export default API_BASE
