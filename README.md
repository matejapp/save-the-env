# save-the-env

A personal secrets manager for storing environment variables per project. Values are encrypted in the browser before being sent to the server, so the backend only ever stores ciphertext.

## Stack

**Backend**
- .NET 10 Web API
- Entity Framework Core 10 + Npgsql (PostgreSQL via Neon)
- BCrypt.Net for password hashing
- JWT Bearer authentication (30-minute tokens, HS256)
- Repository pattern with a service layer
- Global exception middleware that maps typed exceptions to HTTP status codes

**Frontend**
- Vite + React 19 + TypeScript
- Tailwind CSS v4
- react-router-dom v7
- `hash-wasm` for Argon2id key derivation
- Web Crypto API (AES-256-GCM) for encryption

## How encryption works

The server never sees plaintext values. The flow is:

1. After login, the user sets a master passphrase (never transmitted).
2. A random 16-byte salt is generated client-side. Argon2id (3 iterations, 64 MB memory) derives a 32-byte key from the passphrase and salt.
3. A known sentinel string (`VAULT_CANARY_V1`) is encrypted with that key using AES-256-GCM. Both the encrypted canary and the KDF salt are stored server-side in the `user_vault` table.
4. On subsequent logins, the client fetches the salt, re-derives the key, decrypts the canary, and verifies it matches. Wrong passphrase = decryption failure.
5. The `CryptoKey` object lives in a React `useRef` for the session. It is never serialized or written to storage.
6. When saving an env var, the value is encrypted client-side (12-byte random nonce prepended to ciphertext, base64 encoded) before the request is made.

```
passphrase + salt  --[Argon2id]--> CryptoKey (in memory only)
plaintext value    --[AES-256-GCM + random nonce]--> base64(nonce || ciphertext)  --> stored in DB
```

## Project structure

```
save-the-env/
├── Api/                          # .NET Web API
│   ├── Controllers/              # AuthController, ProjectController,
│   │                             #   EnvVarsController, UserVaultController
│   ├── Services/                 # Business logic + interfaces
│   ├── Repositories/             # EF Core data access + interfaces
│   ├── Models/                   # User, Project, EnvVars, UserVault
│   ├── Dto/                      # Request/response shapes
│   ├── Exceptions/               # NotFoundException, ConflictException, etc.
│   ├── Middleware/               # GlobalExceptionMiddleware
│   └── Migrations/               # EF Core migrations
└── Client/                       # Vite React app
    └── src/
        ├── context/              # AuthContext (JWT), VaultContext (CryptoKey)
        ├── lib/                  # api.ts (fetch wrapper), crypto.ts (KDF + AES)
        └── pages/                # Login, Register, VaultUnlock, Projects, ProjectDetail
```

## Running locally

**Prerequisites:** .NET 10 SDK, Node.js 18+, a PostgreSQL database (Neon free tier works)

**Backend**

```bash
cd Api
# add connection string and JWT key to user secrets
dotnet user-secrets set "ConnectionStrings:NeonPostgres" "Host=...;Database=...;Username=...;Password=..."
dotnet user-secrets set "Jwt:Key" "your-secret-key-min-32-chars"

dotnet ef database update
dotnet run
# API runs on http://localhost:5157
```

**Frontend**

```bash
cd Client
npm install
npm run dev
# Dev server runs on http://localhost:5173
# Vite proxies /api/* to http://localhost:5157
```

## Data model

```
User
  id (uuid PK)
  email
  passwordHash
  createdAt

Project
  id (uuid PK)
  name
  userId (FK -> User)

EnvVars
  id (uuid PK)
  key                   -- variable name, stored in plaintext
  encryptedValue        -- base64(nonce || AES-256-GCM ciphertext)
  projectId (FK -> Project)

UserVault
  id (uuid PK)
  kdfSalt               -- base64, 16 bytes, used for Argon2id
  canaryValue           -- encrypted sentinel for passphrase verification
  userId (FK -> User)
```

> [!NOTE]
> `key` (the variable name) is not encrypted. Only values are encrypted. If that matters for your use case, encrypt keys client-side before sending.
