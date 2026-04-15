'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types'

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data ?? [])
    setLoading(false)
  }

  function openNew() { setEditing(null); setShowModal(true) }
  function openEdit(c: Client) { setEditing(c); setShowModal(true) }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    fetchClients()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <button onClick={openNew} className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : !clients.length ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400">No clients yet</p>
            <button onClick={openNew} className="mt-2 text-sm text-blue-600 hover:underline">Add your first client →</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clients.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact info'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="text-xs text-gray-500 hover:text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal
          client={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchClients() }}
        />
      )}
    </div>
  )
}

function ClientModal({ client, onClose, onSaved }: { client: Client | null; onClose: () => void; onSaved: () => void }) {
  const supabase = createClient()
  const [name, setName] = useState(client?.name ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [address, setAddress] = useState(client?.address ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = client
      ? await supabase.from('clients').update({ name, email: email || null, phone: phone || null, address: address || null }).eq('id', client.id)
      : await supabase.from('clients').insert({ name, email: email || null, phone: phone || null, address: address || null, user_id: user.id })

    if (error) { setError(error.message); setLoading(false) }
    else onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{client ? 'Edit Client' : 'Add Client'}</h2>
        {error && <div className="mb-3 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Name *', value: name, set: setName, type: 'text', required: true },
            { label: 'Email', value: email, set: setEmail, type: 'email', required: false },
            { label: 'Phone', value: phone, set: setPhone, type: 'tel', required: false },
            { label: 'Address', value: address, set: setAddress, type: 'text', required: false },
          ].map(({ label, value, set, type, required }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type={type} value={value} onChange={e => set(e.target.value)} required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
