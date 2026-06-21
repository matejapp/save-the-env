import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { encryptValue, decryptValue } from '../lib/crypto'

interface VaultContextType {
  isUnlocked: boolean
  unlock: (key: CryptoKey) => void
  lock: () => void
  encrypt: (plaintext: string) => Promise<string>
  decrypt: (ciphertext: string) => Promise<string>
}

const VaultContext = createContext<VaultContextType | null>(null)

export function VaultProvider({ children }: { children: ReactNode }) {
  const keyRef = useRef<CryptoKey | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)

  function unlock(key: CryptoKey) {
    keyRef.current = key
    setIsUnlocked(true)
  }

  function lock() {
    keyRef.current = null
    setIsUnlocked(false)
  }

  async function encrypt(plaintext: string): Promise<string> {
    if (!keyRef.current) throw new Error('Vault is locked')
    return encryptValue(keyRef.current, plaintext)
  }

  async function decrypt(ciphertext: string): Promise<string> {
    if (!keyRef.current) throw new Error('Vault is locked')
    return decryptValue(keyRef.current, ciphertext)
  }

  return (
    <VaultContext.Provider value={{ isUnlocked, unlock, lock, encrypt, decrypt }}>
      {children}
    </VaultContext.Provider>
  )
}

export function useVault() {
  const ctx = useContext(VaultContext)
  if (!ctx) throw new Error('useVault must be used within VaultProvider')
  return ctx
}
