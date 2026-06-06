import { requireAuth } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)

  const where: Record<string, unknown> = {}

  if (query.status) where.status = query.status
  if (query.search) {
    where.name = { contains: query.search as string }
  }

  const superAdminIds = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    select: { id: true },
  }).then(u => u.map(x => x.id))

  const events = await prisma.event.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      phases: { orderBy: { order: 'asc' } },
      _count: {
        select: {
          tickets: {
            where: superAdminIds.length
              ? { NOT: { sellerId: { in: superAdminIds } }, status: { not: 'CANCELLED' } }
              : { status: { not: 'CANCELLED' } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return events
})
