import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const vendors = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'VENDOR'] }, active: true },
    select: {
      id: true,
      name: true,
      role: true,
      _count: { select: { tickets: true } },
      tickets: {
        select: { soldPrice: true, soldAt: true },
        orderBy: { soldAt: 'desc' },
        take: 1,
      },
    },
  })

  const result = await Promise.all(vendors.map(async (v) => {
    const agg = await prisma.ticket.aggregate({
      where: { sellerId: v.id },
      _sum: { soldPrice: true },
      _count: true,
    })
    return {
      id: v.id,
      name: v.name,
      role: v.role,
      ticketsSold: agg._count,
      revenue: Number(agg._sum.soldPrice ?? 0),
      lastSale: v.tickets[0]?.soldAt ?? null,
    }
  }))

  return result.sort((a, b) => b.ticketsSold - a.ticketsSold)
})
