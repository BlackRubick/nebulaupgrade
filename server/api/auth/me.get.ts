import { requireAuth } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, role: true, isSuperAdmin: true, active: true, createdAt: true },
  })
  if (!user) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
  return user
})
