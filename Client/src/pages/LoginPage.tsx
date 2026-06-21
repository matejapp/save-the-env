import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.auth.login({ email, password })
      login(data!.token)
      navigate('/vault')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-semibold text-[#e5e2e1] mb-2">Welcome back</h1>
          <p className="text-[#c4c9ac] text-sm">Sign in to access your vault</p>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-[#c4c9ac] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="dev@example.com"
                className="w-full bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#8e9379] text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[#c4c9ac] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#8e9379] text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c3f400] hover:bg-[#abd600] text-black font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a] text-center">
            <p className="text-[#8e9379] text-sm">
              No account?{' '}
              <Link to="/register" className="text-[#c3f400] hover:text-[#abd600] transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[#8e9379] text-xs">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          End-to-end encrypted
        </div>
      </div>
    </div>
  )
}
