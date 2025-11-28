import axios from 'axios'
import API_BASE from './config'

export async function getRoles(){
  const res = await axios.get(`${API_BASE}/roles`)
  return res.data
}

export async function createRole(payload){
  const res = await axios.post(`${API_BASE}/roles`, payload)
  return res.data
}

export async function getPermissions(){
  const res = await axios.get(`${API_BASE}/permissions`)
  return res.data
}

export default { getRoles, createRole, getPermissions }
