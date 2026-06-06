import { requireAdmin } from '../../../utils/requireRole'
import { prisma } from '../../../db/client'
import { createAuditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const uuid = getRouterParam(event, 'uuid')!

  const ticket = await prisma.ticket.findUnique({
    where: { uuid },
    include: { buyer: true, event: { select: { name: true } } },
  })

  if (!ticket) throw createError({ statusCode: 404, message: 'Boleto no encontrado' })
  if (ticket.status === 'CANCELLED') throw createError({ statusCode: 400, message: 'El boleto ya está cancelado' })

  await prisma.ticket.update({
    where: { uuid },
    data: { status: 'CANCELLED' },
  })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: admin.userId,
    action: 'CANCEL_TICKET',
    entity: 'Ticket',
    entityId: ticket.id,
    oldValues: { folio: ticket.folio, status: ticket.status, buyer: ticket.buyer?.name },
    newValues: { status: 'CANCELLED' },
    ipAddress: ip,
  })

  return { ok: true }
})
