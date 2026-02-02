import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export const AUTH_COOKIE_NAME = 'auth_token'

export default class CookieAuthMiddleware {
  /**
   * Extrate JWT from HttpOnly cookie and place it into Authorization header
   * for auth guard to be able to work correctly
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const token = ctx.request.cookie(AUTH_COOKIE_NAME)

    if (token) {
      ctx.request.request.headers['authorization'] = `Bearer ${token}`
    }

    return next()
  }
}
