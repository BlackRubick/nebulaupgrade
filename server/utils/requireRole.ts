import type { H3Event } from 'h3'
import type { JWTPayload } from './jwt'

export function requireAuth(event: H3Event): JWTPayload {
  const user = event.context.user as JWTPayload | undefined
  if (!user) throw createError({ statusCode: 401, message: 'No autorizado' })
  return user
}

export function requireAdmin(event: H3Event): JWTPayload {
  const user = requireAuth(event)
  if (user.role !== 'ADMIN' && !user.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Acceso denegado' })
  }
  return user
}

export function requireSuperAdmin(event: H3Event): JWTPayload {
  const user = requireAuth(event)
  if (!user.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Acceso denegado' })
  }
  return user
}

export function requireAdminOrScanner(event: H3Event): JWTPayload {
  const user = requireAuth(event)
  if (!['ADMIN', 'SCANNER'].includes(user.role) && !user.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Acceso denegado' })
  }
  return user
}

export function requireAdminOrVendor(event: H3Event): JWTPayload {
  const user = requireAuth(event)
  if (!['ADMIN', 'VENDOR'].includes(user.role) && !user.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Acceso denegado' })
  }
  return user
}
