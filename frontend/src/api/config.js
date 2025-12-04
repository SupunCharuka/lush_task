// Central API base URL for frontend API modules
// Use Vite environment variable `VITE_API_BASE` in production (set in Vercel).
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default API_BASE
