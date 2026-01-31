import { userUpdateValidator } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  /**
   * PATCH /user/update
   * Update an existing user and return the updated object
   */
  async updateUser({ auth, request, response }: HttpContext) {
    await auth.authenticate() // verify that the user trying to update the onboarding infos is logged

    try {
      const user = auth.user!

      const data = await request.validateUsing(userUpdateValidator)

      // Merge only provided fields
      user.merge(data)

      await user.save()
      await user.refresh()

      return response.ok({
        message: 'User updated successfully',
        user: user,
      })
    } catch (err) {
      if (err.code === 'E_VALIDATION_ERROR') {
        return response.badRequest({
          message: 'User update failed',
          errors: err.messages,
        })
      }

      return response.internalServerError({
        message: 'An error occured during user update',
        error: err.message,
      })
    }
  }
}
