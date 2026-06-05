import { verifyAccessToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const protectedPaths = [
    '/api/events',
    '/api/tickets',
    '/api/users',
    '/api/financial',
    '/api/scan',
    '/api/audit',
    '/api/dashboard',
    '/api/vendors',
    '/api/buyers',
    '/api/phases',
    '/api/auth/logout',
    '/api/auth/me',
  ]

  const path = event.path
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  if (!isProtected) return

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'No autorizado' })
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verifyAccessToken(token)
    event.context.user = payload
  }
  catch {
    throw createError({ statusCode: 401, message: 'Token inválido o expirado' })
  }
})
