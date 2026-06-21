type LogoutFn = () => void
let onUnauthorized: LogoutFn | null = null

export function setUnauthorizedHandler(fn: LogoutFn) {
  onUnauthorized = fn
}

interface RequestOptions extends RequestInit {
  allowNotFound?: boolean
}

async function request<T>(path: string, options?: RequestOptions): Promise<T | null> {
  const { allowNotFound, ...init } = options ?? {}
  const token = localStorage.getItem('token')
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (res.status === 401) {
    onUnauthorized?.()
    throw new Error('Unauthorized')
  }
  if (res.status === 404 && allowNotFound) return null
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as Record<string, string>
    throw new Error(data.error ?? `Request failed: ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json() as Promise<T>
}

export interface VaultDto {
  id: string
  canaryValue: string | null
  kdfSalt: string | null
  userId: string
}

export interface ProjectDto {
  id: string
  name: string
}

export interface EnvVarDto {
  id: string
  key: string | null
  encryptedValue: string | null
  projectId: string
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      request<{ token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { email: string; password: string }) =>
      request<{ token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  },
  vault: {
    get: () => request<VaultDto>('/api/uservault', { allowNotFound: true }),
    create: (body: { canaryValue: string; kdfSalt: string }) =>
      request<VaultDto>('/api/uservault', { method: 'POST', body: JSON.stringify(body) }),
    update: (body: { canaryValue: string; kdfSalt: string }) =>
      request<VaultDto>('/api/uservault', { method: 'PUT', body: JSON.stringify(body) }),
  },
  projects: {
    list: () => request<ProjectDto[]>('/api/project'),
    create: (body: { name: string }) =>
      request<ProjectDto>('/api/project', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/api/project/${id}`, { method: 'DELETE' }),
  },
  envvars: {
    list: (projectId: string) => request<EnvVarDto[]>(`/api/envvars/project/${projectId}`),
    create: (body: { key: string; encryptedValue: string; projectId: string }) =>
      request<EnvVarDto>('/api/envvars', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/api/envvars/${id}`, { method: 'DELETE' }),
  },
}
