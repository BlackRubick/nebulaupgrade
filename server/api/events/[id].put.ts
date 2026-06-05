import { z } from 'zod'
import { requireAdminOrVendor } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().startsWith('https://').optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'FINISHED', 'CANCELLED']).optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireAdminOrVendor(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Datos inválidos' })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  if (user.role === 'VENDOR' && !user.isSuperAdmin && existing.createdById !== user.userId) {
    throw createError({ statusCode: 403, message: 'Sin acceso' })
  }

  const data = { ...parsed.data }
  if (data.date) (data as Record<string, unknown>).date = new Date(data.date)

  const updated = await prisma.event.update({ where: { id }, data })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: user.userId,
    action: 'UPDATE_EVENT',
    entity: 'Event',
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
    newValues: data,
    ipAddress: ip,
  })

  return updated
})
