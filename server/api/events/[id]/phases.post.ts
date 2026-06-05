import { z } from 'zod'
import { requireAdminOrVendor } from '../../../utils/requireRole'
import { prisma } from '../../../db/client'
import { createAuditLog } from '../../../utils/audit'

const schema = z.object({
  phaseName: z.string().min(1),
  ticketPrice: z.number().positive(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireAdminOrVendor(event)
  const eventId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Datos inválidos' })

  const ev = await prisma.event.findUnique({ where: { id: eventId } })
  if (!ev) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  if (user.role === 'VENDOR' && !user.isSuperAdmin && ev.createdById !== user.userId) {
    throw createError({ statusCode: 403, message: 'Sin acceso' })
  }

  await prisma.ticketPhase.updateMany({
    where: { eventId, isActive: true },
    data: { isActive: false },
  })

  const lastPhase = await prisma.ticketPhase.findFirst({
    where: { eventId },
    orderBy: { order: 'desc' },
  })

  const newPhase = await prisma.ticketPhase.create({
    data: {
      eventId,
      phaseName: parsed.data.phaseName,
      ticketPrice: parsed.data.ticketPrice,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
      isActive: true,
      order: (lastPhase?.order ?? 0) + 1,
    },
  })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: user.userId,
    action: 'CREATE_PHASE',
    entity: 'TicketPhase',
    entityId: newPhase.id,
    newValues: { eventId, phaseName: newPhase.phaseName, ticketPrice: String(newPhase.ticketPrice) },
    ipAddress: ip,
  })

  return newPhase
})
