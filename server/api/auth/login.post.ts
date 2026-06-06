import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../db/client'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'
import { createAuditLog } from '../../utils/audit'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(ip: string): void {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_ATTEMPTS) {
      throw createError({ statusCode: 429, message: 'Demasiados intentos. Espera 15 minutos.' })
    }
    entry.count++
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) ?? 'unknown'
  checkRateLimit(ip)

  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Datos inválidos' })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.active) {
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
  }

  // Login correcto — limpiar intentos fallidos
  clearAttempts(ip)

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isSuperAdmin: user.isSuperAdmin,
    name: user.name,
  }

  const accessToken = await signAccessToken(payload)
  const refreshToken = await signRefreshToken({ userId: user.id })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  })

  await createAuditLog({
    userId: user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress: ip,
    userAgent: getHeader(event, 'user-agent'),
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      canSell: user.canSell,
    },
  }
})
