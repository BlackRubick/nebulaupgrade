import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  if (id === admin.userId) {
    throw createError({ statusCode: 400, message: 'No puedes eliminarte a ti mismo' })
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
  if (existing.isSuperAdmin && !admin.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Sin permiso para eliminar SuperAdmin' })
  }

  await prisma.user.delete({ where: { id } })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: admin.userId,
    action: 'DELETE_USER',
    entity: 'User',
    entityId: id,
    oldValues: { name: existing.name, email: existing.email, role: existing.role },
    ipAddress: ip,
  })

  return { ok: true }
})
