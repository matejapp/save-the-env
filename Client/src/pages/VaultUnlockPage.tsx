import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useVault } from '../context/VaultContext'
import { api, type VaultDto } from '../lib/api'
import { generateSalt, deriveKey, createCanary, verifyCanary } from '../lib/crypto'

export default function VaultUnlockPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { unlock } = useVault()
  const [vault, setVault] = useState<VaultDto | null | undefined>(undefined)
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isSetup = vault === null

  useEffect(() => {
    api.vault.get().then(setVault).catch(() => setVault(null))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isSetup && passphrase !== confirm) {
      setError('Passphrases do not match')
      return
    }
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      if (isSetup) {
        const salt = generateSalt()
        const key = await deriveKey(passphrase, salt)
        const canary = await createCanary(key)
        await api.vault.create({ canaryValue: canary, kdfSalt: salt })
        unlock(key)
      } else {
        const key = await deriveKey(passphrase, vault!.kdfSalt!)
        const valid = await verifyCanary(key, vault!.canaryValue!)
        if (!valid) {
          setError('Wrong passphrase')
          return
        }
        unlock(key)
      }
      navigate('/projects')
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'Wrong passphrase') {
        setError('Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (vault === undefined) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <span className="w-5 h-5 border-2 border-[#444933] border-t-[#c3f400] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-[#c3f400] flex items-center justify-center">
              <span className="text-black text-sm font-bold">S</span>
            </div>
            <span className="text-[#e5e2e1] font-semibold text-lg">save-the-env</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#c3f400]/10 border border-[#c3f400]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#c3f400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#e5e2e1] mb-2">
            {isSetup ? 'Secure your vault' : 'Unlock your vault'}
          </h1>
          <p className="text-[#c4c9ac] text-sm max-w-sm mx-auto">
            {isSetup
              ? 'Set a master passphrase to encrypt your secrets. It never leaves your device.'
              : 'Enter your master passphrase to decrypt your secrets.'}
          </p>
        </div>

        {isSetup && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-[#c3f400]/5 border border-[#c3f400]/20 flex gap-3">
            <svg className="w-4 h-4 text-[#c3f400] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-[#c4c9ac] text-xs leading-relaxed">
              This passphrase is <span className="text-[#e5e2e1] font-medium">never sent to our servers</span>. If you lose it, your encrypted data cannot be recovered.
            </p>
          </div>
        )}

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-[#c4c9ac] mb-2">
                {isSetup ? 'Master passphrase' : 'Passphrase'}
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                required
                autoFocus
                placeholder="Enter your passphrase..."
                className="w-full bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#8e9379] font-mono text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
              />
            </div>
            {isSetup && (
              <div>
                <label className="block text-sm text-[#c4c9ac] mb-2">Confirm passphrase</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Confirm your passphrase..."
                  className="w-full bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#8e9379] font-mono text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c3f400] hover:bg-[#abd600] text-black font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{isSetup ? 'Securing...' : 'Unlocking...'}</>
              ) : isSetup ? 'Secure vault' : 'Unlock vault'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={logout}
            className="text-[#8e9379] hover:text-[#c4c9ac] text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
