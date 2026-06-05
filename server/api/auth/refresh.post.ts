import { prisma } from '../../db/client'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const { refreshToken } = await readBody(event)
  if (!refreshToken) {
    throw createError({ statusCode: 400, message: 'Refresh token requerido' })
  }

  let payload: { userId: string }
  try {
    payload = await verifyRefreshToken(refreshToken)
  }
  catch {
    throw createError({ statusCode: 401, message: 'Refresh token inválido' })
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) {
    throw createError({ statusCode: 401, message: 'Refresh token expirado' })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || !user.active) {
    throw createError({ statusCode: 401, message: 'Usuario no encontrado' })
  }

  await prisma.refreshToken.delete({ where: { token: refreshToken } })

  const newPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isSuperAdmin: user.isSuperAdmin,
    name: user.name,
  }

  const accessToken = await signAccessToken(newPayload)
  const newRefreshToken = await signRefreshToken({ userId: user.id })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt },
  })

  return { accessToken, refreshToken: newRefreshToken }
})
