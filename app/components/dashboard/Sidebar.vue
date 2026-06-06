<template>
  <!-- En mobile: se oculta por defecto y aparece como overlay al abrir -->
  <!-- En desktop (lg+): siempre visible fijo a la izquierda -->
  <aside
    class="fixed left-0 top-0 h-full w-64 glass border-r border-purple-900/30 z-40 flex flex-col transition-transform duration-300"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo -->
    <div class="px-5 py-4 border-b border-purple-900/20">
      <NuxtLink to="/dashboard" class="flex items-center justify-center">
        <img
          src="/images/logonebula.png"
          alt="Nebula Eventos"
          class="h-12 w-auto drop-shadow-[0_0_12px_rgba(109,40,217,0.7)]"
        >
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 overflow-y-auto space-y-1">
      <!-- Main — solo admins ven el dashboard -->
      <div v-if="authStore.isAdmin || (!authStore.isVendor && !authStore.isScanner)" class="mb-4">
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Principal</p>
        <NuxtLink
          v-for="item in mainItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-item"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </div>

      <!-- Vendedor: solo boletos -->
      <div v-if="authStore.isVendor && !authStore.isAdmin" class="mb-4">
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Mis boletos</p>
        <NuxtLink to="/dashboard/tickets" class="sidebar-item" :class="{ active: isActive('/dashboard/tickets') }">
          <IconTickets class="w-4 h-4 flex-shrink-0" />
          Boletos
        </NuxtLink>
        <NuxtLink to="/dashboard/tickets/new" class="sidebar-item" :class="{ active: isActive('/dashboard/tickets/new') }">
          <IconSell class="w-4 h-4 flex-shrink-0" />
          Vender boleto
        </NuxtLink>
      </div>

      <!-- Admin: gestión completa -->
      <div v-if="authStore.isAdmin" class="mb-4">
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Gestión</p>
        <NuxtLink
          v-for="item in managementItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-item"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </div>

      <!-- Admin -->
      <div v-if="authStore.isAdmin" class="mb-4">
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Administración</p>
        <NuxtLink
          v-for="item in adminItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-item"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </div>

      <!-- Scanner -->
      <div v-if="authStore.isScanner || authStore.isAdmin">
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-2">Acceso</p>
        <NuxtLink to="/dashboard/scan" class="sidebar-item" :class="{ active: isActive('/dashboard/scan') }">
          <IconScan class="w-4 h-4 flex-shrink-0" />
          Escanear QR
        </NuxtLink>
      </div>
    </nav>

    <!-- User Info -->
    <div class="p-4 border-t border-purple-900/20">
      <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-900/10 transition cursor-pointer" @click="handleLogout">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
          {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-300 truncate">{{ authStore.user?.name }}</p>
          <p class="text-xs text-slate-500 truncate">{{ roleLabel }}</p>
        </div>
        <svg class="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()
const { isOpen, close } = useSidebar()

// Cerrar sidebar al navegar en mobile
watch(() => route.path, () => close())

const roleLabel = computed(() => {
  if (authStore.isSuperAdmin) return 'Super Admin'
  switch (authStore.user?.role) {
    case 'ADMIN': return 'Administrador'
    case 'VENDOR': return 'Vendedor'
    case 'SCANNER': return 'Escáner'
    default: return ''
  }
})

function isActive(path: string) {
  if (route.path === path) return true
  // Eventos tiene sub-rutas dinámicas (/events/[id]), las demás son exactas
  if (path === '/dashboard/events' && route.path.startsWith('/dashboard/events/')) return true
  return false
}

async function handleLogout() {
  await authStore.logout()
  await navigateTo('/nebula-access-portal')
}

const IconDashboard = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }),
  ]),
})

const IconEvents = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }),
  ]),
})

const IconTickets = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' }),
  ]),
})

const IconFinancial = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }),
  ]),
})

const IconUsers = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }),
  ]),
})


const IconScan = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.5' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5Z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z' }),
  ]),
})

const IconSell = defineComponent({
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v16m8-8H4' }),
  ]),
})

const mainItems = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
]

const managementItems = [
  { to: '/dashboard/events', label: 'Eventos', icon: IconEvents },
  { to: '/dashboard/tickets', label: 'Boletos', icon: IconTickets },
]

const adminItems = [
  { to: '/dashboard/financial', label: 'Financiero', icon: IconFinancial },
  { to: '/dashboard/users', label: 'Usuarios', icon: IconUsers },
]
</script>
