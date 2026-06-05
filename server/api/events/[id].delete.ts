import { requireAdminOrVendor } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = requireAdminOrVendor(event)
  const id = getRouterParam(event, 'id')!

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  if (user.role === 'VENDOR' && !user.isSuperAdmin && existing.createdById !== user.userId) {
    throw createError({ statusCode: 403, message: 'Sin acceso' })
  }

  await prisma.event.delete({ where: { id } })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: user.userId,
    action: 'DELETE_EVENT',
    entity: 'Event',
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
    ipAddress: ip,
  })

  return { ok: true }
})
