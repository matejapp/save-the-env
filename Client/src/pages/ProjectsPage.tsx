import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, type ProjectDto } from '../lib/api'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    api.projects.list()
      .then(data => setProjects(data ?? []))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load projects'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const project = await api.projects.create({ name: newName.trim() })
      setProjects(prev => [...prev, project!])
      setNewName('')
      setShowCreate(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.projects.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <header className="border-b border-[#2a2a2a] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#c3f400] flex items-center justify-center">
              <span className="text-black text-xs font-bold">S</span>
            </div>
            <span className="text-[#e5e2e1] font-semibold">save-the-env</span>
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
            <h1 className="text-2xl font-semibold text-[#e5e2e1]">Projects</h1>
            <p className="text-[#8e9379] text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#c3f400] hover:bg-[#abd600] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New project
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="mb-6 bg-[#1c1b1b] border border-[#444933] rounded-xl p-5 flex gap-3">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Project name"
              className="flex-1 bg-[#201f1f] border border-[#444933] rounded-lg px-4 py-2.5 text-[#e5e2e1] placeholder-[#8e9379] text-sm outline-none focus:border-[#c3f400] focus:ring-1 focus:ring-[#c3f400]/30 transition-colors"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-[#c3f400] hover:bg-[#abd600] text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2.5 rounded-lg text-sm text-[#8e9379] hover:text-[#c4c9ac] transition-colors"
            >
              Cancel
            </button>
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
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#201f1f] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#444933]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-[#8e9379] text-sm">No projects yet. Create your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group relative bg-[#1c1b1b] border border-[#2a2a2a] hover:border-[#444933] rounded-xl p-5 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#201f1f] border border-[#2a2a2a] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#c3f400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <button
                    onClick={e => handleDelete(project.id, e)}
                    className="p-1.5 rounded-lg text-[#444933] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-[#e5e2e1] font-medium text-sm">{project.name}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
