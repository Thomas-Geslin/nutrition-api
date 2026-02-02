import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

/**
 * Authentication endpoints
 */
const AuthController = () => import('#controllers/auth')

router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router
      .post('/logout', [AuthController, 'logout'])
      .use([middleware.cookieAuth(), middleware.auth()])

    router
      .get('/getLoggedUserInfo', [AuthController, 'getLoggedUserInfo'])
      .use([middleware.cookieAuth(), middleware.auth()])
  })
  .prefix('/auth')

/**
 * Google OAuth endpoints
 */
router
  .group(() => {
    router.get('/redirect', [AuthController, 'googleRedirect'])
    router.get('/callback', [AuthController, 'googleCallback'])
  })
  .prefix('/google')

/**
 * Onboarding endpoint
 */
const OnboardingController = () => import('#controllers/onboarding')

router
  .post('/onboarding/submit', [OnboardingController, 'submitOnboarding'])
  .use([middleware.cookieAuth(), middleware.auth()])

/**
 * User endpoints
 */
const UserController = () => import('#controllers/user')

router
  .group(() => {
    router
      .patch('/update', [UserController, 'updateUser'])
      .use([middleware.cookieAuth(), middleware.auth()])
  })
  .prefix('/user')
