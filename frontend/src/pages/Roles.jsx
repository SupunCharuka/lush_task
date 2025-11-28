import React, { useEffect, useState } from 'react'
import { getRoles, createRole, getPermissions } from '../api/role'
import StyledInput from '../components/inputs/StyledInput'


export default function Roles(){
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedPerms, setSelectedPerms] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function load(){
      try{
        const [r, p] = await Promise.all([getRoles(), getPermissions()])
        setRoles(r || [])
        setPermissions(p || [])
      }catch(e){
        console.error('Failed to load roles or permissions', e)
      }
    }
    load()
  }, [])

  function togglePerm(idOrName){
    const s = new Set(selectedPerms)
    if(s.has(idOrName)) s.delete(idOrName)
    else s.add(idOrName)
    setSelectedPerms(s)
  }

  async function handleSubmit(e){
    if(e) e.preventDefault()
    setError('')
    setSuccess('')
    if(!name.trim()) return setError('Role name is required')
    setLoading(true)
    try{
      const payload = { name: name.trim(), description: description.trim(), permissions: Array.from(selectedPerms) }
      await createRole(payload)
      setSuccess('Role created')
      setName('')
      setDescription('')
      setSelectedPerms(new Set())
      setShowForm(false)
      // refresh list
      const r = await getRoles()
      setRoles(r || [])
    }catch(err){
      console.error(err)
      setError(err?.response?.data?.error || String(err))
    }finally{
      setLoading(false)
    }
  }

  function fmtPermissions(arr){
    return (arr || []).map(p => p.name || p).join(', ')
  }

  return (
    <div className="max-w-7xl mx-auto p-4">

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-indigo-100 mt-1">Manage roles and assign permissions to control access across the app.</p>
          </div>
          <div className="flex items-center">
            <button onClick={() => setShowForm(true)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded">New Role</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="md:col-span-4">
          <div className="bg-white border rounded p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="mb-0 text-lg font-medium ">Roles</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowForm(prev => !prev)} className="px-3 py-1 rounded border">{showForm ? 'Close' : 'New Role'}</button>
              </div>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-gray-50 border p-3 mb-4 rounded">
                {error && <div className="text-red-600 mb-2">{error}</div>}
                {success && <div className="text-green-600 mb-2">{success}</div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <StyledInput label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="admin" />
                  <StyledInput label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
                  <div />
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium mb-1">Permissions</div>
                  <div className="max-h-40 overflow-auto border rounded p-2 bg-white">
                    {permissions.length === 0 && <div className="text-sm text-gray-500">No permissions defined</div>}
                    {permissions.map(p => (
                      <label key={p._id || p.name} className="flex items-center gap-2 text-sm mb-1">
                        <input type="checkbox" checked={selectedPerms.has(p._id || p.name)} onChange={() => togglePerm(p._id || p.name)} />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded">{loading ? 'Creating...' : 'Create Role'}</button>
                  <button type="button" onClick={() => { setName(''); setDescription(''); setSelectedPerms(new Set()); setError(''); setSuccess(''); setShowForm(false) }} className="px-3 py-1 rounded border">Cancel</button>
                </div>
              </form>
            )}

            <div className="overflow-auto">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Name</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Description</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Permissions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {roles.length === 0 && (
                    <tr><td colSpan={3} className="px-3 py-4 text-center text-sm text-gray-500">No roles</td></tr>
                  )}
                  {roles.map(r => (
                    <tr key={r._id}>
                      <td className="px-3 py-2 text-sm">{r.name}</td>
                      <td className="px-3 py-2 text-sm">{r.description}</td>
                      <td className="px-3 py-2 text-sm">{fmtPermissions(r.permissions)}</td>
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

