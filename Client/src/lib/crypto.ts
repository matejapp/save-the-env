import { argon2id } from 'hash-wasm'

const CANARY = 'VAULT_CANARY_V1'

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
}

export async function deriveKey(passphrase: string, saltB64: string): Promise<CryptoKey> {
  const saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
  const hashHex = await argon2id({
    password: passphrase,
    salt: saltBytes,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536,
    hashLength: 32,
    outputType: 'hex',
  })
  const keyBytes = new Uint8Array(hashHex.length / 2)
  for (let i = 0; i < keyBytes.length; i++) {
    keyBytes[i] = parseInt(hashHex.slice(i * 2, i * 2 + 2), 16)
  }
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encryptValue(key: CryptoKey, plaintext: string): Promise<string> {
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    new TextEncoder().encode(plaintext),
  )
  const combined = new Uint8Array(12 + ciphertext.byteLength)
  combined.set(nonce)
  combined.set(new Uint8Array(ciphertext), 12)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptValue(key: CryptoKey, b64: string): Promise<string> {
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: combined.slice(0, 12) },
    key,
    combined.slice(12),
  )
  return new TextDecoder().decode(plaintext)
}

export async function createCanary(key: CryptoKey): Promise<string> {
  return encryptValue(key, CANARY)
}

export async function verifyCanary(key: CryptoKey, encryptedCanary: string): Promise<boolean> {
  try {
    return await decryptValue(key, encryptedCanary) === CANARY
  } catch {
    return false
  }
}
