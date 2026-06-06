import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  // IDs de super admins — sus boletos no cuentan como ventas
  const superAdmins = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    select: { id: true },
  })
  const superAdminIds = superAdmins.map(u => u.id)
  const excludeSuperAdmin = superAdminIds.length
    ? { NOT: { sellerId: { in: superAdminIds } } }
    : {}

  const notCancelled = { status: { not: 'CANCELLED' } } as const
  const ticketBase = { ...notCancelled, ...excludeSuperAdmin }

  const [
    activeEvents,
    finishedEvents,
    ticketStats,
    revenueResult,
    phaseBreakdown,
    vendorList,
  ] = await Promise.all([
    prisma.event.count({ where: { status: 'ACTIVE' } }),
    prisma.event.count({ where: { status: 'FINISHED' } }),
    prisma.ticket.groupBy({
      by: ['status'],
      where: excludeSuperAdmin,
      _count: { status: true },
    }),
    prisma.ticket.aggregate({
      where: ticketBase,
      _sum: { soldPrice: true },
    }),
    prisma.ticketPhase.findMany({
      include: {
        event: { select: { name: true } },
        _count: { select: { tickets: { where: ticketBase } } },
      },
    }),
    prisma.user.findMany({
      where: { role: 'VENDOR', isSuperAdmin: false },
      select: { id: true, name: true },
    }),
  ])

  const ticketMap = ticketStats.reduce((acc, s) => {
    acc[s.status] = s._count.status
    return acc
  }, {} as Record<string, number>)

  const eventRevenue = await prisma.event.findMany({
    where: { status: { in: ['ACTIVE', 'FINISHED'] } },
    select: {
      id: true,
      name: true,
      status: true,
      _count: { select: { tickets: { where: ticketBase } } },
      tickets: {
        where: ticketBase,
        select: { soldPrice: true },
      },
    },
  })

  const eventsWithRevenue = eventRevenue.map(ev => ({
    id: ev.id,
    name: ev.name,
    status: ev.status,
    ticketsSold: ev._count.tickets,
    revenue: ev.tickets.reduce((sum, t) => sum + Number(t.soldPrice), 0),
  }))

  const phaseSummary = await Promise.all(
    phaseBreakdown.map(async (phase) => {
      const revenue = await prisma.ticket.aggregate({
        where: { phaseId: phase.id, ...ticketBase },
        _sum: { soldPrice: true },
      })
      return {
        id: phase.id,
        eventName: phase.event.name,
        phaseName: phase.phaseName,
        price: Number(phase.ticketPrice),
        sold: phase._count.tickets,
        revenue: Number(revenue._sum.soldPrice ?? 0),
      }
    }),
  )

  const vendorRevenue = await Promise.all(
    vendorList.map(async (v) => {
      const [ticketCount, revenue, lastTicket, phaseGroups] = await Promise.all([
        prisma.ticket.count({
          where: { sellerId: v.id, ...notCancelled },
        }),
        prisma.ticket.aggregate({
          where: { sellerId: v.id, ...notCancelled },
          _sum: { soldPrice: true },
        }),
        prisma.ticket.findFirst({
          where: { sellerId: v.id, ...notCancelled },
          orderBy: { soldAt: 'desc' },
          select: { soldAt: true },
        }),
        prisma.ticket.groupBy({
          by: ['phaseId'],
          where: { sellerId: v.id, ...notCancelled },
          _count: { id: true },
          _sum: { soldPrice: true },
        }),
      ])

      const phaseIds = phaseGroups.map(p => p.phaseId).filter((id): id is string => id !== null)
      const phaseNames = phaseIds.length
        ? await prisma.ticketPhase.findMany({
            where: { id: { in: phaseIds } },
            select: { id: true, phaseName: true },
          })
        : []
      const phaseMap = new Map(phaseNames.map(p => [p.id, p.phaseName]))

      return {
        id: v.id,
        name: v.name,
        ticketsSold: ticketCount,
        revenue: Number(revenue._sum.soldPrice ?? 0),
        lastSale: lastTicket?.soldAt ?? null,
        phases: phaseGroups
          .map(p => ({
            phaseName: p.phaseId ? (phaseMap.get(p.phaseId) ?? '—') : '—',
            count: p._count.id,
            revenue: Number(p._sum.soldPrice ?? 0),
          }))
          .sort((a, b) => b.count - a.count),
      }
    }),
  )

  return {
    overview: {
      activeEvents,
      finishedEvents,
      totalRevenue: Number(revenueResult._sum.soldPrice ?? 0),
      ticketsSold: (ticketMap['AVAILABLE'] ?? 0) + (ticketMap['USED'] ?? 0),
      ticketsUsed: ticketMap['USED'] ?? 0,
      ticketsPending: ticketMap['AVAILABLE'] ?? 0,
      ticketsCancelled: ticketMap['CANCELLED'] ?? 0,
    },
    events: eventsWithRevenue,
    phases: phaseSummary,
    vendors: vendorRevenue.filter(v => v.ticketsSold > 0).sort((a, b) => b.revenue - a.revenue),
  }
})
