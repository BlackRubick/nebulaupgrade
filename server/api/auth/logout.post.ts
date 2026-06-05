import { requireAuth } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const { refreshToken } = await readBody(event)
  if (refreshToken) {
    // Solo eliminar el token si pertenece al usuario autenticado
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId: user.userId },
    }).catch(() => {})
  }
  return { success: true }
})
