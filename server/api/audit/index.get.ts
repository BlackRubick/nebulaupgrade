import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Math.min(Number(query.limit) || 50, 200)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (query.userId) where.userId = query.userId
  if (query.entity) where.entity = query.entity
  const VALID_ACTIONS = ['LOGIN','CREATE_USER','UPDATE_USER','DELETE_USER','CREATE_EVENT','UPDATE_EVENT','DELETE_EVENT','SELL_TICKETS','CANCEL_TICKET','DELETE_TICKET','SCAN_TICKET','CREATE_PHASE','ACTIVATE_PHASE']
  if (query.action && VALID_ACTIONS.includes(query.action as string)) {
    where.action = query.action
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return { logs, total, page, pages: Math.ceil(total / limit) }
})
