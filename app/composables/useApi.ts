export function useApi() {
  const { token } = useAuth()

  async function $api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
    }

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    const res = await fetch(`/api${path}`, { ...options, headers })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(err.message || `Error ${res.status}`)
    }

    return res.json()
  }

  return { $api }
}
