import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'crypto'

export default class AuthController {
  /**
   * POST /auth/register
   * Crée un nouveau compte utilisateur et retourne un access token
   */
  async register({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)

      const user = await User.create({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      })

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      return response.created({
        message: 'User successfully created',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          onboardingCompleted: false,
        },
        token: {
          type: 'bearer',
          value: token.value!.release(),
        },
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validation failed',
          errors: error.messages,
        })
      }
      throw error
    }
  }

  /**
   * POST /auth/login
   * Authentifie un utilisateur et retourne un access token
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      return response.ok({
        message: 'Logged successfully',
        user,
        token: {
          type: 'bearer',
          value: token.value!.release(),
        },
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      return response.unauthorized({
        message: 'Invalid credentials',
      })
    }
  }

  /**
   * POST /auth/logout
   * Révoque le token actif de l'utilisateur
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken

    if (token) {
      await User.accessTokens.delete(user, token.identifier)
    }

    return response.ok({
      message: 'Logout successful',
    })
  }

  /**
   * GET /auth/getLoggedUserInfo
   * Retourne les informations de l'utilisateur authentifié
   */
  async getLoggedUserInfo({ auth, response }: HttpContext) {
    await auth.authenticate()

    const user = auth.getUserOrFail()

    return response.ok({
      user,
    })
  }

  /**
   * GET /google/redirect
   * Connect to google oauth and redirect to callback endpoint
   */
  async googleRedirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  /**
   * GET /google/callback
   * Handle all the logic after successfull google oauth (user creation/find --> JWT creation --> redirect)
   */
  async googleCallback({ ally, response }: HttpContext) {
    try {
      const google = ally.use('google')

      // User has denied access by canceling the login flow
      if (google.accessDenied()) {
        return response.redirect('http://localhost:3000/auth/login?error=access_denied')
      }
      // OAuth state verification failed. This happens when the CSRF cookie gets expired.
      if (google.stateMisMatch()) {
        return response.redirect('http://localhost:3000/auth/login?error=oauth_failed')
      }
      // Google responded with some error
      if (google.hasError()) {
        return response.redirect('http://localhost:3000/auth/login?error=oauth_failed')
      }

      // Access user info
      const googleUser = await google.user()

      // Find or create user in DB
      const user = await User.firstOrCreate(
        { email: googleUser.email },
        {
          googleId: googleUser.id,
          fullName: googleUser.name ?? 'Google User',
          password: randomUUID(), // dummy password
        }
      )

      // Create JWT (Adonis access token)
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      // Redirect to frontend with JWT
      return response.redirect(
        `http://localhost:3000/auth/callback?token=${token.value!.release()}`
      )
    } catch (err) {
      console.error('Google OAuth error:', err)
      return response.redirect('http://localhost:3000/auth/login?error=oauth_failed')
    }
  }
}
