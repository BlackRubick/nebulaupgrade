import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')!

  const ticket = await prisma.ticket.findUnique({
    where: { uuid },
    select: {
      uuid: true,
      folio: true,
      status: true,
      soldAt: true,
      qrCode: true,
      buyer: { select: { name: true } },
      event: { select: { name: true, date: true, location: true, status: true } },
      phase: { select: { phaseName: true } },
    },
  })

  if (!ticket) throw createError({ statusCode: 404, message: 'Boleto no encontrado' })
  return ticket
})
