import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StyledInput from '../components/inputs/StyledInput'
import StyledSelect from '../components/inputs/StyledSelect'
import { createUser, getUsers } from '../api/user'
import { getRoles } from '../api/role'

export default function CreateUser() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [availableRoles, setAvailableRoles] = useState([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function loadUsers() {
      try {
        const u = await getUsers()
        setUsers(u || [])
      } catch (e) {
        console.error('Failed to load users', e)
      }
    }
    loadUsers()
    // load roles for assignment
    async function loadRoles() {
      try {
        const r = await getRoles()
        if (Array.isArray(r) && r.length) {
          const mapped = r.map(x => x.name || x)
          setAvailableRoles(mapped)
          
          setRole(prev => prev || mapped[0] || '')
        }
      } catch (e) {
        // fallback stays (empty list)
      }
    }
    loadRoles()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {

      const payload = { name: name.trim(), email: email.trim(), role, password }

      const defaultRole = availableRoles[0] || ''
      if (role && role !== defaultRole) payload.roles = [role]
      await createUser(payload)
      setSuccess('User created successfully')
      setName('')
      setEmail('')
      setRole(availableRoles[0] || '')
      setPassword('')
      setConfirmPassword('')
      // refresh users list after successful creation
      try { const u = await getUsers(); setUsers(u || []) } catch (e) { console.error('Failed to refresh users', e) }
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  function fmtDate(s) {
    if (!s) return '—'
    try { const d = new Date(s); return d.toLocaleString() } catch (e) { return '—' }
  }

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role === 'admin').length
  const latest = users[0]?.createdAt ? new Date(users[0].createdAt).toLocaleDateString() : '—'

  return (
    <div className="max-w-7xl mx-auto p-4">

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Create User</h1>
            <p className="text-indigo-100 mt-1">Add new users and manage basic account settings.</p>
          </div>
          <div className="flex items-center">
            <button onClick={() => { setName(''); setEmail(''); setRole('user'); setPassword(''); setConfirmPassword(''); setError(''); setSuccess('') }} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded">Reset</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Total Users</div>
            <div className="text-xl font-semibold">{totalUsers}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Admins</div>
            <div className="text-xl font-semibold">{adminCount}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Recent Signup</div>
            <div className="text-xl font-semibold">{latest}</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Pending</div>
            <div className="text-xl font-semibold">—</div>
          </div>
          <div className="bg-white/5 p-3 rounded">
            <div className="text-sm text-indigo-100">Actions</div>
            <div className="text-xl font-semibold">Create</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium ">New User</h3>
            </div>

            <form onSubmit={handleSubmit} className="bg-gray-50 border p-3 mb-4 rounded">
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {success && <div className="text-green-600 mb-2">{success}</div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <StyledInput
                  label="Full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                />

                <StyledInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                />

                <StyledSelect
                  label="Role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  options={availableRoles}
                />

                <StyledInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter a password"
                />

                <StyledInput
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded">{loading ? 'Creating...' : 'Create User'}</button>
                <button type="button" onClick={() => { setName(''); setEmail(''); setRole('user'); setPassword(''); setConfirmPassword(''); setError(''); setSuccess('') }} className="px-3 py-1 rounded border">Reset</button>
              </div>
            </form>

            <div className="overflow-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Email</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Role</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {users.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">No users</td></tr>
                  )}

                  {users.map((u, i) => (
                    <tr key={u.id || u._id || i}>
                      <td className="px-3 py-2 text-sm">{u.name}</td>
                      <td className="px-3 py-2 text-sm">{u.email}</td>
                      <td className="px-3 py-2 text-sm">{u.role}</td>
                      <td className="px-3 py-2 text-sm">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
