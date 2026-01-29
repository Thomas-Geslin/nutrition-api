import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Middleware d'authentification pour API REST
 * Vérifie que l'utilisateur est authentifié via un access token
 * Retourne une erreur 401 si non authentifié (pas de redirection)
 */
export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const guards = options.guards?.length ? options.guards : [ctx.auth.defaultGuard]

    await ctx.auth.authenticateUsing(guards)
    return next()
  }
}