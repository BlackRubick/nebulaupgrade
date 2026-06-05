import { SignJWT, jwtVerify } from 'jose'

const getSecret = (key: string) => new TextEncoder().encode(key)

export interface JWTPayload {
  userId: string
  email: string
  role: string
  isSuperAdmin: boolean
  name: string
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  const config = useRuntimeConfig()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret(config.jwtSecret))
}

export async function signRefreshToken(payload: { userId: string }): Promise<string> {
  const config = useRuntimeConfig()
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret(config.jwtRefreshSecret))
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const config = useRuntimeConfig()
  const { payload } = await jwtVerify(token, getSecret(config.jwtSecret))
  return payload as unknown as JWTPayload
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  const config = useRuntimeConfig()
  const { payload } = await jwtVerify(token, getSecret(config.jwtRefreshSecret))
  return payload as unknown as { userId: string }
}
