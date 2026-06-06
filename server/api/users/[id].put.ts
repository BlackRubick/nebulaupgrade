import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireAdmin } from '../../utils/requireRole'
import { prisma } from '../../db/client'
import { createAuditLog } from '../../utils/audit'

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'VENDOR', 'SCANNER']).optional(),
  active: z.boolean().optional(),
  canSell: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Datos inválidos' })

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
  if (existing.isSuperAdmin && !admin.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Sin permiso' })
  }
  if (parsed.data.isSuperAdmin !== undefined && !admin.isSuperAdmin) {
    throw createError({ statusCode: 403, message: 'Solo un Super Admin puede cambiar ese rol' })
  }

  const data: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.password) data.password = await bcrypt.hash(parsed.data.password, 12)

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true, canSell: true },
  })

  // Strip password hash before logging — never store credential material in audit logs
  const { password: _pw, ...safeData } = data
  const ip = getRequestIP(event)
  await createAuditLog({
    userId: admin.userId,
    action: 'UPDATE_USER',
    entity: 'User',
    entityId: id,
    oldValues: { name: existing.name, role: existing.role, active: existing.active },
    newValues: safeData,
    ipAddress: ip,
  })

  return updated
})
