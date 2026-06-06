import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isSuperAdmin: true,
      active: true,
      canSell: true,
      createdAt: true,
      _count: { select: { tickets: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users
})
