import { z } from 'zod'
import QRCode from 'qrcode'
import { requireAdminOrVendor } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { buildFolio } from '../../utils/folio'
import { createAuditLog } from '../../utils/audit'

const schema = z.object({
  eventId: z.string(),
  buyerName: z.string().min(1).max(100),
  buyerPhone: z.string().min(1).max(20),
  buyerEmail: z.string().email().optional(),
  quantity: z.number().int().min(1).max(20).default(1),
})

export default defineEventHandler(async (event) => {
  const user = requireAdminOrVendor(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Datos inválidos', data: parsed.error.flatten() })
  }

  const { eventId, buyerName, buyerPhone, buyerEmail, quantity } = parsed.data
  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || 'http://localhost:3000'

  const ev = await prisma.event.findUnique({
    where: { id: eventId },
    include: { phases: { where: { isActive: true } } },
  })

  if (!ev) throw createError({ statusCode: 404, message: 'Evento no encontrado' })
  if (ev.status !== 'ACTIVE') throw createError({ statusCode: 400, message: 'Evento no activo' })

  const activePhase = ev.phases[0]
  if (!activePhase) throw createError({ statusCode: 400, message: 'No hay fase activa' })

  // Creación atómica: verificar capacidad + crear buyer + tickets en una transacción
  const result = await prisma.$transaction(async (tx) => {
    const soldCount = await tx.ticket.count({
      where: { eventId, status: { not: 'CANCELLED' } },
    })

    if (soldCount + quantity > ev.capacity) {
      throw createError({ statusCode: 400, message: 'Sin capacidad disponible' })
    }

    const buyer = await tx.buyer.create({
      data: { name: buyerName, phone: buyerPhone, email: buyerEmail },
    })

    const ticketRecords = []
    for (let i = 0; i < quantity; i++) {
      const rec = await tx.ticket.create({
        data: {
          folio: 'PENDING',
          soldPrice: activePhase.ticketPrice,
          phaseId: activePhase.id,
          sellerId: user.userId,
          buyerId: buyer.id,
          eventId,
          status: 'AVAILABLE',
        },
      })
      // Folio basado en el ID numérico del ticket — sin race condition
      const folio = buildFolio(eventId, rec.uuid)
      const qrUrl = `${baseUrl}/ticket/${rec.uuid}`
      const qrCode = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: { dark: '#050816', light: '#ffffff' },
      })
      const updated = await tx.ticket.update({
        where: { id: rec.id },
        data: { folio, qrCode },
        include: {
          buyer: true,
          phase: true,
          event: { select: { name: true, date: true, location: true } },
          seller: { select: { name: true } },
        },
      })
      ticketRecords.push(updated)
    }

    return { tickets: ticketRecords, buyer }
  })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: user.userId,
    action: 'SELL_TICKETS',
    entity: 'Ticket',
    newValues: { eventId, quantity, buyerName, phase: activePhase.phaseName, price: String(activePhase.ticketPrice) },
    ipAddress: ip,
  })

  return result
})
