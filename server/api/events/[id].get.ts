import { requireAuth } from '../../utils/requireRole'
import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const ev = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      phases: { orderBy: { order: 'asc' } },
      _count: { select: { tickets: true } },
    },
  })

  if (!ev) throw createError({ statusCode: 404, message: 'Evento no encontrado' })

  if (user.role === 'VENDOR' && !user.isSuperAdmin && ev.createdById !== user.userId) {
    throw createError({ statusCode: 403, message: 'Sin acceso' })
  }

  return ev
})
