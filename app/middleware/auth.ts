export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/nebula-access-portal')
  }

  // Scanner: solo puede estar en /dashboard/scan
  if (authStore.isScanner && !authStore.isAdmin) {
    if (!to.path.startsWith('/dashboard/scan')) {
      return navigateTo('/dashboard/scan')
    }
  }
})
