import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'VENDOR', 'SCANNER']),
  isSuperAdmin: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Datos inválidos', data: parsed.error.flatten() })
  }

  // Solo un SuperAdmin puede crear otro SuperAdmin
  if (parsed.data.isSuperAdmin && !admin.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Solo un Super Admin puede crear otro Super Admin' })
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) throw createError({ statusCode: 409, message: 'Email ya en uso' })

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  const user = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    select: { id: true, name: true, email: true, role: true, isSuperAdmin: true, active: true, createdAt: true },
  })

  const ip = getRequestIP(event)
  await createAuditLog({
    userId: admin.userId,
    action: 'CREATE_USER',
    entity: 'User',
    entityId: user.id,
    newValues: { name: user.name, email: user.email, role: user.role },
    ipAddress: ip,
  })

  return user
})
