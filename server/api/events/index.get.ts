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

  const events = await prisma.event.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      phases: { orderBy: { order: 'asc' } },
      _count: { select: { tickets: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return events
})
