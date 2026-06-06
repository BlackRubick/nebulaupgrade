interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  isSuperAdmin: boolean
  canSell: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const storedRefreshToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN' || user.value?.isSuperAdmin)
  const isSuperAdmin = computed(() => user.value?.isSuperAdmin ?? false)
  const isVendor = computed(() => user.value?.role === 'VENDOR')
  const isScanner = computed(() => user.value?.role === 'SCANNER')
  const canSell = computed(() => {
    if (user.value?.isSuperAdmin) return true
    if (!['ADMIN', 'VENDOR'].includes(user.value?.role ?? '')) return false
    return user.value?.canSell !== false
  })
  const canManage = computed(() => user.value?.role === 'ADMIN' || user.value?.isSuperAdmin)

  async function login(email: string, password: string) {
    const data = await $fetch<{ accessToken: string, refreshToken: string, user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    accessToken.value = data.accessToken
    storedRefreshToken.value = data.refreshToken
    user.value = data.user

    if (process.client) {
      localStorage.setItem('nebula_refresh', data.refreshToken)
    }

    return data
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken: storedRefreshToken.value },
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
    }
    catch {}
    finally {
      accessToken.value = null
      storedRefreshToken.value = null
      user.value = null
      if (process.client) localStorage.removeItem('nebula_refresh')
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    const rt = storedRefreshToken.value ?? (process.client ? localStorage.getItem('nebula_refresh') : null)
    if (!rt) return false

    try {
      const data = await $fetch<{ accessToken: string, refreshToken: string }>('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: rt },
      })
      accessToken.value = data.accessToken
      storedRefreshToken.value = data.refreshToken
      if (process.client) localStorage.setItem('nebula_refresh', data.refreshToken)
      return true
    }
    catch {
      accessToken.value = null
      storedRefreshToken.value = null
      user.value = null
      return false
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      const me = await $fetch<AuthUser>('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
      user.value = me
    }
    catch {
      await logout()
    }
  }

  async function init() {
    if (process.client) {
      const rt = localStorage.getItem('nebula_refresh')
      if (rt) {
        storedRefreshToken.value = rt
        const ok = await refreshAccessToken()
        if (ok) await fetchMe()
      }
    }
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isVendor,
    isScanner,
    canSell,
    canManage,
    login,
    logout,
    refreshAccessToken,
    fetchMe,
    init,
  }
})
