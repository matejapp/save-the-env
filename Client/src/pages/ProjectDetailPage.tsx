import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useVault } from '../context/VaultContext'
import { api, type EnvVarDto } from '../lib/api'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { encrypt, decrypt } = useVault()
  const [envVars, setEnvVars] = useState<EnvVarDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState<Map<string, string>>(new Map())
  const [decrypting, setDecrypting] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!id) return
    api.envvars.list(id)
      .then(data => setEnvVars(data ?? []))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load variables'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newKey.trim() || !newValue.trim()) return
    setAdding(true)
    try {
      const encryptedValue = await encrypt(newValue.trim())
      const created = await api.envvars.create({ key: newKey.trim(), encryptedValue, projectId: id! })
      setEnvVars(prev => [...prev, created!])
      setNewKey('')
      setNewValue('')
      setShowAdd(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add variable')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(varId: string) {
    try {
      await api.envvars.delete(varId)
      setEnvVars(prev => prev.filter(v => v.id !== varId))
      setRevealed(prev => { const m = new Map(prev); m.delete(varId); return m })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete variable')
    }
  }

  async function toggleReveal(v: EnvVarDto) {
    if (revealed.has(v.id)) {
      setRevealed(prev => { const m = new Map(prev); m.delete(v.id); return m })
      return
    }
    if (!v.encryptedValue) return
    setDecrypting(prev => new Set(prev).add(v.id))
    try {
      const plaintext = await decrypt(v.encryptedValue)
      setRevealed(prev => new Map(prev).set(v.id, plaintext))
    } catch {
      setError('Decryption failed — wrong passphrase?')
    } finally {
      setDecrypting(prev => { const s = new Set(prev); s.delete(v.id); return s })
    }
  }

  async function handleCopy(v: EnvVarDto) {
    const plaintext = revealed.get(v.id) ?? (v.encryptedValue ? await decrypt(v.encryptedValue).catch(() => null) : null)
    if (!plaintext) return
    await navigator.clipboard.writeText(plaintext)
    setCopied(v.id)
    setTimeout(() => setCopied(null), 1500)
  }

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <header className="border-b border-[#2a2a2a] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/projects" className="text-[#8e9379] hover:text-[#c4c9ac] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#c3f400] flex items-center justify-center">
                <span className="text-black text-xs font-bold">S</span>
              </div>
              <span className="text-[#e5e2e1] font-semibold">save-the-env</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[#8e9379] hover:text-[#c4c9ac] text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#e5e2e1]">Environment Variables</h1>
            <p className="text-[#8e9379] text-sm mt-1">{envVars.length} variable{envVars.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#c3f400] hover:bg-[#abd600] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add variable
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="mb-6 bg-[#1c1b1b] border border-[#444933] rounded-xl p-5">
            <div className="flex gap-3 mb-3">
              <input
                autoFocus
                type="text"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="KEY_NAME"
                className="flex-1 bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-2.5 text-[#e5e2e1] placeholder-[#8e9379] font-mono text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
              />
              <input
                type="text"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                placeholder="value (encrypted before sending)"
                className="flex-1 bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-2.5 text-[#e5e2e1] placeholder-[#8e9379] font-mono text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-lg text-sm text-[#8e9379] hover:text-[#c4c9ac] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="bg-[#c3f400] hover:bg-[#abd600] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {adding ? 'Encrypting...' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-5 h-5 border-2 border-[#444933] border-t-[#c3f400] rounded-full animate-spin" />
          </div>
        ) : envVars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#201f1f] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#444933]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-[#8e9379] text-sm">No variables yet. Add your first one.</p>
          </div>
        ) : (
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8e9379] uppercase tracking-wider w-2/5">Key</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#8e9379] uppercase tracking-wider">Value</th>
                  <th className="px-5 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {envVars.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`${i < envVars.length - 1 ? 'border-b border-[#2a2a2a]' : ''} hover:bg-[#201f1f] transition-colors`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-sm text-[#c3f400]">{v.key ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-sm text-[#c4c9ac] break-all">
                        {decrypting.has(v.id)
                          ? <span className="text-[#8e9379]">decrypting...</span>
                          : revealed.has(v.id)
                            ? revealed.get(v.id)
                            : '••••••••••••'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => toggleReveal(v)}
                          title={revealed.has(v.id) ? 'Hide' : 'Reveal'}
                          className="p-1.5 rounded-lg text-[#8e9379] hover:text-[#c4c9ac] hover:bg-[#2a2a2a] transition-colors"
                        >
                          {revealed.has(v.id) ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(v)}
                          title="Copy value"
                          className="p-1.5 rounded-lg text-[#8e9379] hover:text-[#c4c9ac] hover:bg-[#2a2a2a] transition-colors"
                        >
                          {copied === v.id ? (
                            <svg className="w-4 h-4 text-[#c3f400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-[#8e9379] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
