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

/**
 * Validator pour la demande de réinitialisation de mot de passe
 * - Email valide
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

/**
 * Validator pour la réinitialisation du mot de passe
 * - Token requis
 * - Email valide
 * - Nouveau mot de passe minimum 8 caractères
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string(),
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8),
  })
)
