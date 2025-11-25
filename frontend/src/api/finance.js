
import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

export async function getCampaigns(){
	const res = await axios.get(`${API_BASE}/campaigns`)
	return res.data
}

export async function createCampaign(payload){
	const res = await axios.post(`${API_BASE}/campaigns`, payload)
	return res.data
}

export async function updateCampaign(id, payload){
	const res = await axios.put(`${API_BASE}/campaigns/${id}`, payload)
	return res.data
}

export async function deleteCampaign(id){
	const res = await axios.delete(`${API_BASE}/campaigns/${id}`)
	return res.data
}

export async function getLeadsByPlatform(){
	const res = await axios.get(`${API_BASE}/leads-by-platform`)
	return res.data
}

export async function getMonthlyCampaigns(){
	const res = await axios.get(`${API_BASE}/monthly-campaigns`)
	return res.data
}

export default API_BASE

