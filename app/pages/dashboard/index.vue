<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-white">
          Bienvenido, <span class="gradient-text">{{ authStore.user?.name }}</span>
        </h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ today }}</p>
      </div>
      <NuxtLink v-if="authStore.canSell" to="/dashboard/tickets/new" class="btn-nebula btn-primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Vender boleto
      </NuxtLink>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="stat in statCards" :key="stat.label" class="card-nebula p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-8 pointer-events-none" :style="`background:${stat.color}`" />
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="`background:${stat.color}20`">
            <component :is="stat.icon" class="w-5 h-5" :style="`color:${stat.color}`" />
          </div>
          <span class="text-xs font-mono text-slate-600 uppercase tracking-wider">{{ stat.period }}</span>
        </div>
        <div class="font-display text-3xl font-black text-white mb-1">{{ stat.format(stat.value) }}</div>
        <p class="text-sm text-slate-500">{{ stat.label }}</p>
        <div class="absolute bottom-0 left-0 h-0.5 w-full" :style="`background: linear-gradient(to right, ${stat.color}60, transparent)`" />
      </div>
    </div>

    <!-- Chart + Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Sales Chart -->
      <div class="lg:col-span-2 card-nebula p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-display font-semibold text-white">Ventas por día</h3>
            <p class="text-xs text-slate-500 mt-0.5">Últimos 30 días</p>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-violet-500" />
            <span class="text-xs text-slate-500">Boletos</span>
          </div>
        </div>

        <div v-if="loading" class="h-48 flex items-end gap-1">
          <div v-for="i in 20" :key="i" class="skeleton flex-1 rounded-t" :style="`height:${20 + Math.random()*60}%`" />
        </div>
        <div v-else-if="chartData.every(d => d.count === 0)" class="h-48 flex flex-col items-center justify-center text-slate-600">
          <svg class="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="text-sm">Sin ventas en los últimos 30 días</p>
        </div>
        <div v-else class="h-48 flex items-end gap-1">
          <div
            v-for="(day, i) in chartData"
            :key="i"
            class="flex-1 rounded-t transition-all duration-300 relative group cursor-default"
            :style="`height:${day.pct}%; background: linear-gradient(to top, #6D28D9, #2563EB); min-height: 3px;`"
          >
            <div class="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 border border-purple-900/30 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
              {{ day.count }} {{ day.count === 1 ? 'boleto' : 'boletos' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card-nebula p-6">
        <h3 class="font-display font-semibold text-white mb-5">Accesos rápidos</h3>
        <div class="space-y-2">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-violet-500/20 transition-all duration-200 group"
            :style="`background:${action.bg}`"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="`background:${action.color}20`">
              <component :is="action.icon" class="w-4 h-4" :style="`color:${action.color}`" />
            </div>
            <span class="text-sm font-medium text-slate-300 group-hover:text-white transition">{{ action.label }}</span>
            <svg class="ml-auto w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Vendor Ranking (solo admin) -->
    <div v-if="authStore.isAdmin" class="card-nebula p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-display font-semibold text-white">Ventas por vendedor</h3>
          <p class="text-xs text-slate-500 mt-0.5">Todos los vendedores registrados</p>
        </div>
        <NuxtLink to="/dashboard/financial" class="text-xs text-violet-400 hover:text-violet-300 transition font-medium">
          Ver detalle financiero →
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 4" :key="i" class="skeleton h-12 rounded-lg" />
      </div>

      <!-- Sin vendedores -->
      <div v-else-if="vendorRanking.length === 0" class="py-10 text-center text-slate-600">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <p class="text-sm">Sin vendedores registrados</p>
      </div>

      <!-- Gráfica de barras horizontales -->
      <div v-else class="space-y-4">
        <div v-for="(vendor, i) in vendorRanking" :key="vendor.id">
          <!-- Nombre + número a la derecha -->
          <div class="flex items-center justify-between mb-1.5 gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <!-- Avatar inicial -->
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                :class="i === 0 && vendor.ticketsSold > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-violet-900/30 text-violet-400'"
              >
                {{ vendor.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-sm font-semibold truncate" :class="i === 0 && vendor.ticketsSold > 0 ? 'text-white' : 'text-slate-300'">
                {{ vendor.name }}
              </span>
              <!-- Corona al primero si tiene ventas -->
              <span v-if="i === 0 && vendor.ticketsSold > 0" class="text-amber-400 text-xs">★ Top</span>
            </div>

            <div class="text-right flex-shrink-0 flex items-center gap-3">
              <span class="font-mono text-xs text-slate-500">${{ vendor.revenue.toLocaleString('es-MX') }}</span>
              <span class="font-mono font-bold text-sm w-16 text-right" :class="vendor.ticketsSold > 0 ? (i === 0 ? 'text-amber-400' : 'text-violet-400') : 'text-slate-600'">
                {{ vendor.ticketsSold }} <span class="text-xs font-normal text-slate-500">{{ vendor.ticketsSold === 1 ? 'boleto' : 'boletos' }}</span>
              </span>
            </div>
          </div>

          <!-- Barra -->
          <div class="h-3 rounded-full bg-purple-950/50 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :style="`width:${vendorBarPct(vendor.ticketsSold)}%; background: ${
                vendor.ticketsSold === 0 ? 'transparent' :
                i === 0 ? 'linear-gradient(to right,#F59E0B,#EF4444)' :
                i === 1 ? 'linear-gradient(to right,#7C3AED,#2563EB)' :
                'linear-gradient(to right,#5B21B6,#1D4ED8)'
              }`"
            />
          </div>
        </div>

        <!-- Total general -->
        <div class="flex items-center justify-between pt-4 mt-2 border-t border-purple-900/20">
          <span class="text-xs text-slate-500">Total acumulado</span>
          <span class="font-mono font-bold text-emerald-400">
            {{ vendorRanking.reduce((s, v) => s + v.ticketsSold, 0) }} boletos
            · ${{ vendorRanking.reduce((s, v) => s + v.revenue, 0).toLocaleString('es-MX') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Recent Sales -->
    <div class="card-nebula overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-purple-900/20">
        <div>
          <h3 class="font-display font-semibold text-white">Ventas recientes</h3>
          <p class="text-xs text-slate-500 mt-0.5">Últimos 10 boletos vendidos</p>
        </div>
        <NuxtLink to="/dashboard/tickets" class="text-xs text-violet-400 hover:text-violet-300 transition font-medium">
          Ver todos →
        </NuxtLink>
      </div>

      <div v-if="loading" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="skeleton h-10 rounded-lg" />
      </div>

      <div v-else-if="recentSales.length === 0" class="p-12 text-center">
        <svg class="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
        </svg>
        <p class="text-slate-500 text-sm">Sin ventas recientes</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table-nebula">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Comprador</th>
              <th>Evento</th>
              <th>Fase</th>
              <th>Precio</th>
              <th v-if="authStore.isAdmin" class="hidden sm:table-cell">Vendedor</th>
              <th class="hidden sm:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ticket in recentSales" :key="ticket.id">
              <td><span class="font-mono text-xs text-violet-400 font-semibold">{{ ticket.folio }}</span></td>
              <td class="font-medium text-slate-200">{{ ticket.buyer?.name }}</td>
              <td class="text-slate-400 text-xs max-w-[140px] truncate">{{ ticket.event?.name }}</td>
              <td>
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono" style="background:rgba(6,182,212,0.12);color:#67E8F9;border:1px solid rgba(6,182,212,0.2);">
                  {{ ticket.phase?.phaseName }}
                </span>
              </td>
              <td class="font-mono font-semibold text-cyan-400">${{ Number(ticket.soldPrice).toLocaleString('es-MX') }}</td>
              <td v-if="authStore.isAdmin" class="hidden sm:table-cell text-slate-500 text-xs">{{ ticket.seller?.name }}</td>
              <td class="hidden sm:table-cell text-slate-600 text-xs font-mono">{{ formatDate(ticket.soldAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const authStore = useAuthStore()
if (authStore.isVendor && !authStore.isAdmin) {
  await navigateTo('/dashboard/tickets')
}

const { $api } = useApi()

interface RecentTicket {
  id: string
  folio: string
  soldPrice: number
  soldAt: string
  buyer?: { name: string }
  event?: { name: string }
  phase?: { phaseName: string }
  seller?: { name: string }
}

interface VendorRank {
  id: string
  name: string
  ticketsSold: number
  revenue: number
}

const loading = ref(true)
const stats = ref({ totalEvents: 0, totalTickets: 0, totalRevenue: 0 })
const recentSales = ref<RecentTicket[]>([])
const salesByDay = ref<{ date: string, count: number, revenue: number }[]>([])
const vendorRanking = ref<VendorRank[]>([])

const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

onMounted(async () => {
  try {
    const data = await $api<{
      stats: typeof stats.value
      recentSales: RecentTicket[]
      salesByDay: typeof salesByDay.value
      vendorRanking: VendorRank[]
    }>('/dashboard/stats')
    stats.value = data.stats
    recentSales.value = data.recentSales
    salesByDay.value = data.salesByDay
    vendorRanking.value = data.vendorRanking ?? []
  }
  finally {
    loading.value = false
  }
})

// ── SVG Icon components ─────────────────────────────
const IconCalendar = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })]) })
const IconTicket = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })]) })
const IconMoney = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })]) })
const IconSell = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v16m8-8H4' })]) })
const IconEvent = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })]) })
const IconScan = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H4a1 1 0 00-1 1v1M20 8h1a1 1 0 011 1v1M9 20H5a1 1 0 01-1-1v-4' })]) })
const IconFinancial = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]) })
const IconTickets = defineComponent({ render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.75' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })]) })

// ── Stat Cards ──────────────────────────────────────
const statCards = computed(() => [
  {
    icon: IconCalendar,
    label: 'Eventos activos',
    value: stats.value.totalEvents,
    format: (v: number) => v.toString(),
    color: '#7C3AED',
    period: 'Total',
  },
  {
    icon: IconTicket,
    label: 'Boletos vendidos',
    value: stats.value.totalTickets,
    format: (v: number) => v.toLocaleString('es-MX'),
    color: '#2563EB',
    period: 'Total',
  },
  {
    icon: IconMoney,
    label: 'Ingresos totales',
    value: stats.value.totalRevenue,
    format: (v: number) => `$${v.toLocaleString('es-MX')}`,
    color: '#06B6D4',
    period: 'Total',
  },
])

// ── Quick Actions ───────────────────────────────────
const quickActions = computed(() => {
  const actions = []
  if (authStore.canSell) {
    actions.push(
      { to: '/dashboard/tickets/new', label: 'Vender boleto', icon: IconSell, color: '#7C3AED', bg: 'rgba(109,40,217,0.08)' },
      { to: '/dashboard/events/new', label: 'Crear evento', icon: IconEvent, color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      { to: '/dashboard/tickets', label: 'Ver boletos', icon: IconTickets, color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
    )
  }
  if (authStore.isScanner || authStore.isAdmin) {
    actions.push({ to: '/dashboard/scan', label: 'Escanear QR', icon: IconScan, color: '#10B981', bg: 'rgba(16,185,129,0.08)' })
  }
  if (authStore.isAdmin) {
    actions.push({ to: '/dashboard/financial', label: 'Centro financiero', icon: IconFinancial, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' })
  }
  return actions
})

// ── Sales Chart ─────────────────────────────────────
const chartData = computed(() => {
  if (!salesByDay.value.length) return Array.from({ length: 20 }, () => ({ pct: 0, count: 0 }))
  const max = Math.max(...salesByDay.value.map(d => d.count), 1)
  return salesByDay.value.slice(-30).map(d => ({
    pct: Math.max((d.count / max) * 100, 3),
    count: d.count,
  }))
})

// ── Vendor Chart ────────────────────────────────────
const maxVendorTickets = computed(() => Math.max(...vendorRanking.value.map(v => v.ticketsSold), 1))

function vendorBarPct(tickets: number) {
  return Math.max((tickets / maxVendorTickets.value) * 100, 4)
}

function formatDate(date: unknown) {
  return new Date(date as string).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}
</script>
