<template>
  <header class="h-16 glass border-b border-purple-900/20 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <!-- Hamburguesa — solo mobile -->
      <button
        class="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/20 transition"
        @click="sidebar.toggle()"
      >
        <svg v-if="!sidebar.isOpen.value" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <h1 class="font-display font-semibold text-slate-200 text-base md:text-lg">{{ pageTitle }}</h1>
      <div class="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot hidden sm:block" />
    </div>

    <div class="flex items-center gap-2 md:gap-4">
      <span class="text-xs text-slate-500 font-mono hidden md:block">{{ currentDate }}</span>
      <div class="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg glass border border-purple-900/20">
        <div class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        <span class="text-xs text-slate-400 hidden sm:block">Sistema activo</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebar = useSidebar()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': 'Panel de Control',
    '/dashboard/events': 'Eventos',
    '/dashboard/tickets': 'Boletos',
    '/dashboard/tickets/new': 'Vender Boleto',
    '/dashboard/financial': 'Centro Financiero',
    '/dashboard/users': 'Gestión de Usuarios',
    '/dashboard/scan': 'Control de Acceso',
  }
  return map[route.path] ?? 'NEBULA EVENTOS'
})

const currentDate = computed(() =>
  new Date().toLocaleDateString('es-MX', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  }),
)
</script>
