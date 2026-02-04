import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'crypto'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { AUTH_COOKIE_NAME } from '#middleware/cookie_auth_middleware'

// httpOnly cookie life time
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

const FRONTEND_URL = env.get('FRONTEND_URL', 'http://localhost:3000')

export default class AuthController {
  /**
   * Set authentication cookie function
   */
  private setAuthCookie(response: HttpContext['response'], token: string, rememberMe = true) {
    response.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: app.inProduction, // HTTPS only in prod
      sameSite: 'lax', // CSRF Protection : no cookie present on cross-site request
      path: '/', // Cookie available on every endpoint
      maxAge: rememberMe ? COOKIE_MAX_AGE_SECONDS : undefined,
    })
  }

  /**
   * Delete authentication cookie function
   */
  private clearAuthCookie(response: HttpContext['response']) {
    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: app.inProduction,
      sameSite: 'lax',
      path: '/',
    })
  }

  /**
   * POST /auth/register
   * Create a new user and send its data in the response
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

      // Put the token in a httpOnly cookie
      this.setAuthCookie(response, token.value!.release(), true)

      return response.created({
        message: 'User successfully created',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          onboardingCompleted: false,
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
   * Authentify a user and send back his related infos
   */
  async login({ request, response }: HttpContext) {
    try {
      const { email, password, rememberMe } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: rememberMe ? '30 days' : '1 days',
      })

      // Put the token in a httpOnly cookie
      this.setAuthCookie(response, token.value!.release(), rememberMe)

      return response.ok({
        message: 'Logged successfully',
        user,
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
   *
   * POST /auth/logout
   * Logout an user (Revoke token and delete cookie)
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken

    // Revoke JWT token
    if (token) {
      await User.accessTokens.delete(user, token.identifier)
    }

    // Delete httpOnly cookie on client-side
    this.clearAuthCookie(response)

    return response.ok({
      message: 'Logout successful',
    })
  }

  /**
   * GET /auth/getLoggedUserInfo
   * Send back authentified user data with nutrition profile and food preferences
   */
  async getLoggedUserInfo({ auth, response }: HttpContext) {
    await auth.authenticate()

    const user = auth.getUserOrFail()

    // Preload nutrition profile and food preferences
    await user.load('nutritionProfile')
    await user.load('foodPreferences')

    const nutritionProfile = user.nutritionProfile
    const foodPreferences = user.foodPreferences

    // TODO: refactor those return
    // If onboarding not completed, return partial AuthUser
    if (!user.onboardingCompleted) {
      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          onboardingCompleted: user.onboardingCompleted,
          // Partial profile data if available
          ...(nutritionProfile && {
            age: nutritionProfile.age,
            gender: nutritionProfile.gender,
            height: nutritionProfile.height,
            weight: nutritionProfile.weight,
            activityLevel: nutritionProfile.activityLevel,
            goal: nutritionProfile.goal,
            dietaryRestrictions: nutritionProfile.dietaryRestrictions ?? [],
          }),
          foodPreferences: foodPreferences?.map((fp) => ({
            foodName: fp.foodName,
            liked: fp.liked,
          })) ?? [],
        },
      })
    }

    // Full User with complete nutritionProfile
    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        onboardingCompleted: user.onboardingCompleted,
        nutritionProfile: nutritionProfile
          ? {
              age: nutritionProfile.age!,
              gender: nutritionProfile.gender!,
              height: nutritionProfile.height!,
              weight: nutritionProfile.weight!,
              activityLevel: nutritionProfile.activityLevel!,
              goal: nutritionProfile.goal!,
              dietaryRestrictions: nutritionProfile.dietaryRestrictions ?? [],
              // Nutrition intake values
              bmr: nutritionProfile.bmr!,
              tdee: nutritionProfile.tdee!,
              caloriesConsumption: nutritionProfile.dailyCaloriesConsumption!,
              proteinsIntake: nutritionProfile.proteinIntake!,
              carbsIntake: nutritionProfile.carbsIntake!,
              fatIntake: nutritionProfile.fatIntake!,
            }
          : null,
        foodPreferences: foodPreferences?.map((fp) => ({
          foodName: fp.foodName,
          liked: fp.liked,
        })) ?? [],
      },
    })
  }

  /**
   * GET /google/redirect
   * Init Google oauth flow
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
        return response.redirect(`${FRONTEND_URL}/auth/login?error=access_denied`)
      }
      // OAuth state verification failed. This happens when the CSRF cookie gets expired.
      if (google.stateMisMatch()) {
        return response.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`)
      }
      // Google responded with some error
      if (google.hasError()) {
        return response.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`)
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

      // Update googleId if user already exist
      if (!user.googleId) {
        user.googleId = googleUser.id
        await user.save()
      }

      // Create JWT (Adonis access token)
      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      // Put token in httpOnly cookie
      this.setAuthCookie(response, token.value!.release(), true)

      // Redirect to frontend
      if (!user.onboardingCompleted) {
        return response.redirect(`${FRONTEND_URL}/onboarding/profile`)
      }

      return response.redirect(`${FRONTEND_URL}/dashboard`)
    } catch (err) {
      console.error('Google OAuth error:', err)
      return response.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`)
    }
  }
}
