/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

/**
 * Authentication enpoint
 */
const AuthController = () => import('#controllers/auth')

router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/getLoggedUserInfo', [AuthController, 'getLoggedUserInfo']).use(middleware.auth())
  })
  .prefix('/auth')

/**
 * Google OAuth enpoint
 */
router
  .group(() => {
    router.get('/redirect', [AuthController, 'googleRedirect'])
    router.get('/callback', [AuthController, 'googleCallback'])
  })
  .prefix('/google')

/**
 * Onboarding enpoint
 */
const OnboardingController = () => import('#controllers/onboarding')

router.post('/onboarding/submit', [OnboardingController, 'submitOnboarding']).use(middleware.auth())

/**
 * User endpoint
 */
const UserController = () => import('#controllers/user')

router
  .group(() => {
    router.patch('/update', [UserController, 'updateUser']).use(middleware.auth())
  })
  .prefix('/user')
