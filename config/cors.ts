import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration CORS pour accepter le frontend Next.js
 * En production, remplacer localhost:3000 par votre domaine réel
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,

  // Origines autorisées (Next.js en développement)
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:3000',
    ]

    if (!origin || allowedOrigins.includes(origin)) {
      return true
    }

    return false
  },

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
  headers: true,
  exposeHeaders: ['Authorization'],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
