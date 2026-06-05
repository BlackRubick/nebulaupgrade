import { requireAdminOrScanner } from '../../../utils/requireRole'
import { prisma } from '../../../db/client'

export default defineEventHandler(async (event) => {
  requireAdminOrScanner(event)
  const uuid = getRouterParam(event, 'uuid')!

  const ticket = await prisma.ticket.findUnique({
    where: { uuid },
    include: {
      buyer: { select: { name: true } },
      event: { select: { id: true, name: true, date: true, location: true, status: true } },
      phase: { select: { phaseName: true } },
    },
  })

  if (!ticket) return { valid: false, reason: 'INVALID', message: 'Boleto no válido' }
  if (ticket.event.status !== 'ACTIVE') return { valid: false, reason: 'EVENT_INACTIVE', message: 'Evento no activo', ticket }
  if (ticket.status === 'CANCELLED') return { valid: false, reason: 'CANCELLED', message: 'Boleto cancelado', ticket }
  if (ticket.status === 'USED') return { valid: false, reason: 'ALREADY_USED', message: 'Boleto ya utilizado', ticket }

  return { valid: true, reason: 'VALID', message: 'Acceso autorizado', ticket }
})
