export function useAuth() {
  const authStore = useAuthStore()
  return {
    token: computed(() => authStore.accessToken),
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isAdmin: computed(() => authStore.isAdmin),
    isSuperAdmin: computed(() => authStore.isSuperAdmin),
    isVendor: computed(() => authStore.isVendor),
    isScanner: computed(() => authStore.isScanner),
  }
}
