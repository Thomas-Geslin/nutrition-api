import vine from '@vinejs/vine'

/**
 * Validator for menu generation request
 * Date is optional - defaults to today if not provided
 */
export const generateMenuValidator = vine.compile(
  vine.object({
    date: vine
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
)
