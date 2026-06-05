import { requireAdminOrScanner } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = requireAdminOrScanner(event)
  const uuid = getRouterParam(event, 'uuid')!

  const ticket = await prisma.ticket.findUnique({
    where: { uuid },
    include: {
      buyer: true,
      event: { select: { id: true, name: true, status: true } },
      phase: { select: { phaseName: true } },
    },
  })

  if (!ticket) {
    return { success: false, reason: 'INVALID', message: 'Boleto no válido' }
  }

  if (ticket.event.status !== 'ACTIVE') {
    return { success: false, reason: 'EVENT_INACTIVE', message: 'Evento no activo' }
  }

  if (ticket.status === 'CANCELLED') {
    return { success: false, reason: 'CANCELLED', message: 'Boleto cancelado', ticket }
  }

  if (ticket.status === 'USED') {
    return { success: false, reason: 'ALREADY_USED', message: 'Boleto ya utilizado', ticket }
  }

  await prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'USED' } })

  const ip = getRequestIP(event)

  await prisma.scanLog.create({
    data: {
      ticketId: ticket.id,
      scannerId: user.userId,
      eventId: ticket.event.id,
      ipAddress: ip,
    },
  })

  await createAuditLog({
    userId: user.userId,
    action: 'SCAN_TICKET',
    entity: 'Ticket',
    entityId: ticket.id,
    newValues: { status: 'USED' },
    ipAddress: ip,
  })

  return {
    success: true,
    reason: 'VALID',
    message: 'Acceso autorizado',
    ticket: { ...ticket, status: 'USED' },
  }
})
