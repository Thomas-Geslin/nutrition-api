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

const AuthController = () => import('#controllers/auth')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

/**
 * Routes d'authentification
 */
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/getLoggedUserInfo', [AuthController, 'getLoggedUserInfo']).use(middleware.auth())
  })
  .prefix('/auth')
