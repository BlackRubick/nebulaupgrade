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

  // Los boletos de super admin no cuentan como ventas
  return users.map(u => ({
    ...u,
    _count: { tickets: u.isSuperAdmin ? 0 : u._count.tickets },
  }))
})
