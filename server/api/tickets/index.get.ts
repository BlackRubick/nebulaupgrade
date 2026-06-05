import { requireAuth } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  if (user.role === 'SCANNER') {
    throw createError({ statusCode: 403, message: 'Acceso denegado' })
  }
  const query = getQuery(event)

  const where: Record<string, unknown> = {}

  if (user.role === 'VENDOR' && !user.isSuperAdmin) {
    where.sellerId = user.userId
  }

  if (query.eventId) where.eventId = query.eventId
  if (query.status) where.status = query.status
  if (query.sellerId && (user.role === 'ADMIN' || user.isSuperAdmin)) where.sellerId = query.sellerId
  if (query.phaseId) where.phaseId = query.phaseId

  if (query.search) {
    where.OR = [
      { folio: { contains: query.search as string } },
      { buyer: { name: { contains: query.search as string } } },
      { buyer: { phone: { contains: query.search as string } } },
    ]
  }

  if (query.dateFrom || query.dateTo) {
    where.soldAt = {}
    if (query.dateFrom) (where.soldAt as Record<string, unknown>).gte = new Date(query.dateFrom as string)
    if (query.dateTo) (where.soldAt as Record<string, unknown>).lte = new Date(query.dateTo as string)
  }

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 50, 200)
  const skip = (page - 1) * limit

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        buyer: true,
        phase: { select: { phaseName: true, ticketPrice: true } },
        event: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        scanLogs: {
          select: { scannedAt: true },
          orderBy: { scannedAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { soldAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ])

  return { tickets, total, page, pages: Math.ceil(total / limit) }
})
