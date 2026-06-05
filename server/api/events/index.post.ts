import { z } from 'zod'
import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

const phaseSchema = z.object({
  phaseName: z.string().min(1),
  ticketPrice: z.number().positive(),
})

const schema = z.object({
  name: z.string().min(1),
  date: z.string(),
  location: z.string().min(1),
  status: z.enum(['DRAFT', 'ACTIVE', 'FINISHED', 'CANCELLED']).default('ACTIVE'),
  phases: z.array(phaseSchema).min(1).max(3),
})

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Datos inválidos', data: parsed.error.flatten() })
  }

  const { phases, ...eventData } = parsed.data

  const newEvent = await prisma.event.create({
    data: {
      ...eventData,
      description: '',
      capacity: 999999,
      date: new Date(eventData.date),
      createdById: user.userId,
      phases: {
        create: phases.map((p, i) => ({
          phaseName: p.phaseName,
          ticketPrice: p.ticketPrice,
          isActive: i === 0,
          order: i + 1,
        })),
      },
    },
    include: { phases: true },
  })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: user.userId,
    action: 'CREATE_EVENT',
    entity: 'Event',
    entityId: newEvent.id,
    newValues: { name: newEvent.name },
    ipAddress: ip,
  })

  return newEvent
})
