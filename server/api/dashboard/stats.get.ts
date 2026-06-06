import { Prisma } from '@prisma/client'
import { requireAuth } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)

  const isAdmin = user.role === 'ADMIN' || user.isSuperAdmin
  const sellerId = isAdmin ? undefined : user.userId

  // Excluir siempre boletos de super admins de las estadísticas
  const superAdmins = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    select: { id: true },
  })
  const superAdminIds = superAdmins.map(u => u.id)

  const baseWhere = {
    ...(sellerId ? { sellerId } : {}),
    ...(superAdminIds.length ? { sellerId: { notIn: superAdminIds } } : {}),
  }

  // Si hay sellerId específico Y superAdminIds, combinar correctamente
  const ticketWhere = sellerId
    ? { sellerId, ...(superAdminIds.length ? { NOT: { sellerId: { in: superAdminIds } } } : {}) }
    : (superAdminIds.length ? { NOT: { sellerId: { in: superAdminIds } } } : {})

  const eventWhere = sellerId ? { createdById: sellerId } : {}

  const [
    totalEvents,
    totalTickets,
    totalRevenue,
    recentSales,
    salesByDay,
    vendorList,
  ] = await Promise.all([
    prisma.event.count({ where: eventWhere }),
    prisma.ticket.count({ where: { ...ticketWhere, status: { not: 'CANCELLED' } } }),
    prisma.ticket.aggregate({
      where: { ...ticketWhere, status: { not: 'CANCELLED' } },
      _sum: { soldPrice: true },
    }),
    prisma.ticket.findMany({
      where: ticketWhere,
      include: {
        buyer: { select: { name: true, phone: true } },
        event: { select: { name: true } },
        phase: { select: { phaseName: true } },
        seller: { select: { name: true } },
      },
      orderBy: { soldAt: 'desc' },
      take: 10,
    }),
    superAdminIds.length
      ? prisma.$queryRaw<Array<{ date: string, count: bigint, revenue: number }>>`
          SELECT
            DATE(soldAt) as date,
            COUNT(*) as count,
            SUM(CAST(soldPrice AS DECIMAL(10,2))) as revenue
          FROM tickets
          WHERE status != 'CANCELLED'
          ${sellerId ? Prisma.sql`AND sellerId = ${sellerId}` : Prisma.empty}
          AND sellerId NOT IN (${Prisma.join(superAdminIds)})
          AND soldAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(soldAt)
          ORDER BY date ASC
        `
      : prisma.$queryRaw<Array<{ date: string, count: bigint, revenue: number }>>`
          SELECT
            DATE(soldAt) as date,
            COUNT(*) as count,
            SUM(CAST(soldPrice AS DECIMAL(10,2))) as revenue
          FROM tickets
          WHERE status != 'CANCELLED'
          ${sellerId ? Prisma.sql`AND sellerId = ${sellerId}` : Prisma.empty}
          AND soldAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          GROUP BY DATE(soldAt)
          ORDER BY date ASC
        `,
    isAdmin
      ? prisma.user.findMany({
          where: { role: 'VENDOR', isSuperAdmin: false },
          select: {
            id: true,
            name: true,
            tickets: {
              where: { status: { not: 'CANCELLED' } },
              select: { soldPrice: true },
            },
          },
        })
      : Promise.resolve([]),
  ])

  const vendorRanking = (vendorList as Array<{ id: string, name: string, tickets: { soldPrice: unknown }[] }>)
    .map(v => ({
      id: v.id,
      name: v.name,
      ticketsSold: v.tickets.length,
      revenue: v.tickets.reduce((s, t) => s + Number(t.soldPrice), 0),
    }))
    .sort((a, b) => b.ticketsSold - a.ticketsSold)

  return {
    stats: {
      totalEvents,
      totalTickets,
      totalRevenue: Number(totalRevenue._sum.soldPrice ?? 0),
    },
    recentSales,
    salesByDay: (salesByDay as Array<{ date: string, count: bigint, revenue: number }>).map(r => ({
      date: r.date,
      count: Number(r.count),
      revenue: Number(r.revenue),
    })),
    vendorRanking,
  }
})
