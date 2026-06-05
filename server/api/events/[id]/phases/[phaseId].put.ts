import { requireAdminOrVendor } from '../../../../utils/requireRole'
import { prisma } from '../../../../db/client'
import { createAuditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const user = requireAdminOrVendor(event)
  const eventId = getRouterParam(event, 'id')!
  const phaseId = getRouterParam(event, 'phaseId')!

  const ev = await prisma.event.findUnique({ where: { id: eventId } })
  if (!ev) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  if (user.role === 'VENDOR' && !user.isSuperAdmin && ev.createdById !== user.userId) {
    throw createError({ statusCode: 403, message: 'Sin acceso' })
  }

  const phase = await prisma.ticketPhase.findFirst({ where: { id: phaseId, eventId } })
  if (!phase) throw createError({ statusCode: 404, message: 'Fase no encontrada' })

  // Desactivar todas las fases del evento
  await prisma.ticketPhase.updateMany({
    where: { eventId },
    data: { isActive: false },
  })

  // Activar la fase seleccionada
  const updated = await prisma.ticketPhase.update({
    where: { id: phaseId },
    data: { isActive: true },
  })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: user.userId,
    action: 'ACTIVATE_PHASE',
    entity: 'TicketPhase',
    entityId: phaseId,
    newValues: { phaseName: phase.phaseName, ticketPrice: String(phase.ticketPrice) },
    ipAddress: ip,
  })

  return updated
})
