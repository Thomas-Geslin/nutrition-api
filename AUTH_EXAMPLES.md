# API d'Authentification - Guide d'utilisation

## Configuration préalable

Avant de tester l'API, assurez-vous que :

1. PostgreSQL est démarré
2. Les migrations sont exécutées : `node ace migration:run`
3. Le serveur est démarré : `npm run dev`

L'API tourne sur `http://localhost:3333`

---

## Endpoints disponibles

### 1. 📝 Inscription (Register)

Crée un nouveau compte utilisateur.

**Endpoint:** `POST /auth/register`

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "fullName": "Jean Dupont"
}
```

**Exemple cURL:**
```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "motdepasse123",
    "fullName": "Jean Dupont"
  }'
```

**Exemple fetch (JavaScript/TypeScript):**
```typescript
const response = await fetch('http://localhost:3333/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'motdepasse123',
    fullName: 'Jean Dupont',
  }),
})

const data = await response.json()
console.log(data)
```

**Réponse (201 Created):**
```json
{
  "message": "Compte créé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Jean Dupont",
    "createdAt": "2026-01-29T10:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- `400 Bad Request` : Email déjà utilisé ou validation échouée
- `422 Unprocessable Entity` : Données invalides

---

### 2. 🔐 Connexion (Login)

Authentifie un utilisateur et retourne un access token.

**Endpoint:** `POST /auth/login`

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Exemple cURL:**
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "motdepasse123"
  }'
```

**Exemple fetch (JavaScript/TypeScript):**
```typescript
const response = await fetch('http://localhost:3333/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'motdepasse123',
  }),
})

const data = await response.json()

// Sauvegarder le token (localStorage, cookie, etc.)
localStorage.setItem('authToken', data.token.value)
```

**Réponse (200 OK):**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Jean Dupont"
  },
  "token": {
    "type": "bearer",
    "value": "oat_NjAuMTA5LjE5Ny4yMDg.ZGVmYXVsdA.TjFmZ0pVWVB..."
  }
}
```

**Erreurs possibles:**
- `401 Unauthorized` : Identifiants invalides
- `400 Bad Request` : Validation échouée

---

### 3. 👤 Récupérer l'utilisateur connecté (getLoggedUserInfo)

Retourne les informations de l'utilisateur authentifié.

**Endpoint:** `GET /auth/getLoggedUserInfo`

**Headers requis:**
```
Authorization: Bearer {votre_token}
```

**Exemple cURL:**
```bash
curl -X GET http://localhost:3333/auth/getLoggedUserInfo \
  -H "Authorization: Bearer oat_NjAuMTA5LjE5Ny4yMDg.ZGVmYXVsdA.TjFmZ0pVWVB..."
```

**Exemple fetch (JavaScript/TypeScript):**
```typescript
const token = localStorage.getItem('authToken')

const response = await fetch('http://localhost:3333/auth/getLoggedUserInfo', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const data = await response.json()
console.log(data)
```

**Réponse (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Jean Dupont",
    "createdAt": "2026-01-29T10:00:00.000Z",
    "updatedAt": "2026-01-29T10:00:00.000Z"
  }
}
```

**Erreurs possibles:**
- `401 Unauthorized` : Token invalide ou expiré

---

### 4. 🚪 Déconnexion (Logout)

Révoque le token d'accès actif.

**Endpoint:** `POST /auth/logout`

**Headers requis:**
```
Authorization: Bearer {votre_token}
```

**Exemple cURL:**
```bash
curl -X POST http://localhost:3333/auth/logout \
  -H "Authorization: Bearer oat_NjAuMTA5LjE5Ny4yMDg.ZGVmYXVsdA.TjFmZ0pVWVB..."
```

**Exemple fetch (JavaScript/TypeScript):**
```typescript
const token = localStorage.getItem('authToken')

const response = await fetch('http://localhost:3333/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const data = await response.json()

// Supprimer le token sauvegardé
localStorage.removeItem('authToken')
```

**Réponse (200 OK):**
```json
{
  "message": "Déconnexion réussie"
}
```

**Erreurs possibles:**
- `401 Unauthorized` : Token invalide

---

## Intégration Next.js

### Configuration du client API

Créez un fichier `lib/api.ts` dans votre projet Next.js :

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export async function register(email: string, password: string, fullName?: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, fullName }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Registration failed')
  }

  return response.json()
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Login failed')
  }

  const data = await response.json()

  // Sauvegarder le token
  localStorage.setItem('authToken', data.token.value)

  return data
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/auth/getLoggedUserInfo`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }

  return response.json()
}

export async function logout(token: string) {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }

  localStorage.removeItem('authToken')

  return response.json()
}
```

### Hook React pour l'authentification

Créez `hooks/useAuth.ts` :

```typescript
'use client'

import { useState, useEffect } from 'react'
import * as api from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      api.getMe(token)
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('authToken'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const data = await api.login(email, password)
    setUser(data.user)
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      await api.logout(token)
    }
    setUser(null)
  }

  return { user, loading, login: handleLogin, logout: handleLogout }
}
```

---

## Sécurité et bonnes pratiques implémentées

✅ **Hash sécurisé** : Passwords hashés avec scrypt (algorithme robuste)
✅ **Validation stricte** : Email valide + password min 8 caractères
✅ **Unicité email** : Vérification côté validateur
✅ **Token sécurisé** : Access tokens stockés en base, expiration 30 jours
✅ **Pas de password dans les réponses** : `serializeAs: null` sur le champ password
✅ **CORS configuré** : Accepte uniquement localhost:3000 et localhost:3001
✅ **Messages d'erreur propres** : Retours structurés et clairs

---

## Prochaines étapes (optionnel)

- [ ] Ajouter un endpoint `/auth/refresh` pour renouveler les tokens
- [ ] Implémenter la réinitialisation de mot de passe
- [ ] Ajouter la vérification d'email
- [ ] Configurer OAuth (Google, GitHub, etc.)
- [ ] Ajouter des rate limits sur les endpoints sensibles
- [ ] Implémenter la vérification 2FA

---

## Configuration base de données

Assurez-vous que PostgreSQL est configuré et que les credentials dans `.env` sont corrects :

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=votre_user
DB_PASSWORD=votre_password
DB_DATABASE=votre_database
```

Puis exécutez :
```bash
node ace migration:run
```
