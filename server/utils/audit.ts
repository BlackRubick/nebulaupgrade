import { Prisma } from '@prisma/client'
import { prisma } from '../db/client'

interface AuditOptions {
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(opts: AuditOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        entity: opts.entity,
        entityId: opts.entityId,
        oldValues: opts.oldValues ? (opts.oldValues as Prisma.InputJsonValue) : undefined,
        newValues: opts.newValues ? (opts.newValues as Prisma.InputJsonValue) : undefined,
        ipAddress: opts.ipAddress,
        userAgent: opts.userAgent,
      },
    })
  }
  catch (e) {
    console.error('[Audit] Failed to create audit log:', e)
  }
}
