import axios from 'axios'
const API_BASE = 'http://localhost:5000/api'

export async function createUser(payload){
  const res = await axios.post(`${API_BASE}/users`, payload)
  return res.data
}

export async function getUsers(){
  const res = await axios.get(`${API_BASE}/users`)
  return res.data
}

export default API_BASE
