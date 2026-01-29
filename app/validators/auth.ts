import vine from '@vinejs/vine'

/**
 * Validator pour l'inscription (register)
 * - Email valide et unique
 * - Password minimum 8 caractères
 */
export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(8),
    fullName: vine.string().optional(),
  })
)

/**
 * Validator pour la connexion (login)
 * - Email valide
 * - Password requis
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)
