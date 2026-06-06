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

  // Borrar registros relacionados primero para evitar error de foreign key
  await prisma.scanLog.deleteMany({ where: { ticketId: ticket.id } })
  await prisma.ticket.delete({ where: { id: ticket.id } })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: admin.userId,
    action: 'DELETE_TICKET',
    entity: 'Ticket',
    entityId: ticket.id,
    oldValues: { folio: ticket.folio, status: ticket.status, buyer: ticket.buyer?.name },
    ipAddress: ip,
  })

  return { ok: true }
})
