import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { VaultProvider, useVault } from './context/VaultContext'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import VaultUnlockPage from './pages/VaultUnlockPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function VaultRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const { isUnlocked } = useVault()
  if (!token) return <Navigate to="/login" replace />
  if (!isUnlocked) return <Navigate to="/vault" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/vault" element={<ProtectedRoute><VaultUnlockPage /></ProtectedRoute>} />
      <Route path="/projects" element={<VaultRoute><ProjectsPage /></VaultRoute>} />
      <Route path="/projects/:id" element={<VaultRoute><ProjectDetailPage /></VaultRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </VaultProvider>
    </AuthProvider>
  )
}
