
// Use Vite environment variable `VITE_API_BASE` when provided.
// Fallback to a relative `/api` path so the frontend can call a proxied backend
// when both are hosted together (recommended for simple deployments).
const envBase = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
	? import.meta.env.VITE_API_BASE
	: null

export const API_BASE = envBase || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')

export default API_BASE
