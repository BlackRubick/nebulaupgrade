<template>
  <div class="space-y-5">

    <!-- ── HEADER FIJO (siempre visible) ────────────────── -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Toggle vendedor/todos — solo admin, siempre en el mismo lugar -->
        <button
          v-if="authStore.isAdmin"
          class="btn-nebula btn-secondary text-sm gap-2"
          @click="mode === 'vendors' ? switchToAll() : backToVendors()"
        >
          <svg v-if="mode === 'vendors'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          {{ mode === 'vendors' ? 'Ver todos los boletos' : 'Ver por vendedor' }}
        </button>
        <!-- Info del vendedor seleccionado -->
        <div v-if="mode === 'tickets' && selectedVendor" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {{ selectedVendor.name.charAt(0) }}
          </div>
          <span class="text-white font-semibold text-sm">{{ selectedVendor.name }}</span>
          <span class="text-xs text-violet-400 font-mono">{{ total }} boleto{{ total !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      <!-- Vender boleto — siempre en el mismo lugar -->
      <NuxtLink v-if="authStore.canSell" to="/dashboard/tickets/new" class="btn-nebula btn-primary text-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Vender boleto
      </NuxtLink>
    </div>

    <!-- ── MODO VENDEDORES (solo admin) ──────────────── -->
    <template v-if="authStore.isAdmin && mode === 'vendors'">

      <div v-if="loadingVendors" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="i in 6" :key="i" class="skeleton h-36 rounded-xl" />
      </div>

      <div v-else-if="vendors.length === 0" class="card-nebula p-12 text-center">
        <svg class="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
        <p class="text-slate-500 text-sm">Sin vendedores registrados</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <button
          v-for="(vendor, i) in vendors"
          :key="vendor.id"
          class="card-nebula p-5 text-left hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(109,40,217,0.12)] transition-all duration-200 group relative overflow-hidden"
          @click="selectVendor(vendor)"
        >
          <div class="absolute top-3 right-3 text-xs font-mono text-slate-600">#{{ i + 1 }}</div>
          <div class="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity" style="background:#7C3AED" />
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {{ vendor.name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-white text-sm truncate">{{ vendor.name }}</p>
              <span class="text-xs px-1.5 py-0.5 rounded font-mono" :class="vendor.role === 'ADMIN' ? 'text-cyan-400 bg-cyan-900/20' : 'text-violet-400 bg-violet-900/20'">
                {{ vendor.role === 'ADMIN' ? 'Admin' : 'Vendedor' }}
              </span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="text-2xl font-bold font-mono text-white">{{ vendor.ticketsSold }}</div>
              <div class="text-xs text-slate-500">Boletos</div>
            </div>
            <div>
              <div class="text-lg font-bold font-mono text-cyan-400">${{ vendor.revenue.toLocaleString('es-MX') }}</div>
              <div class="text-xs text-slate-500">Ingresos</div>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-purple-900/20 text-xs text-slate-600 font-mono">
            {{ vendor.lastSale ? `Última: ${formatDate(vendor.lastSale)}` : 'Sin ventas aún' }}
          </div>
          <svg class="absolute bottom-4 right-4 w-4 h-4 text-slate-700 group-hover:text-violet-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- ── MODO CUADRÍCULA DE BOLETOS ─────────────────── -->
    <template v-else>

      <!-- Stats por fase (solo vendor) -->
      <div v-if="!authStore.isAdmin && phaseStats.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div v-for="ps in phaseStats" :key="ps.phase" class="card-nebula p-4 text-center">
          <div class="text-xl font-bold font-mono text-white">{{ ps.count }}</div>
          <div class="text-xs text-violet-400 font-mono mt-0.5">{{ ps.phase }}</div>
          <div class="text-xs text-cyan-400 font-mono">${{ ps.revenue.toLocaleString('es-MX') }}</div>
        </div>
      </div>

      <!-- Buscador único -->
      <div class="relative max-w-sm">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="search"
          placeholder="Buscar por nombre o código..."
          class="input-nebula w-full"
          style="padding-left:2.5rem;"
          @input="debounceFetch"
        >
        <button v-if="search" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition" @click="search = ''; fetchTickets()">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="skeleton h-44 rounded-xl" />
      </div>

      <!-- Empty -->
      <div v-else-if="tickets.length === 0" class="card-nebula p-12 text-center">
        <svg class="w-10 h-10 mx-auto mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
        </svg>
        <p class="text-slate-500 text-sm">{{ search ? 'Sin resultados para "' + search + '"' : 'Sin boletos' }}</p>
      </div>

      <!-- Grid de boletos -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="card-nebula overflow-hidden flex flex-col"
        >
          <!-- Top color bar por estado -->
          <div class="h-1 w-full" :class="ticket.status === 'AVAILABLE' ? 'bg-gradient-to-r from-violet-600 to-cyan-500' : ticket.status === 'USED' ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-slate-700'" />

          <div class="p-4 flex flex-col flex-1">
            <!-- Folio + estado -->
            <div class="flex items-center justify-between mb-3">
              <span class="font-mono text-sm font-bold text-violet-400">{{ ticket.folio }}</span>
              <span class="badge text-xs" :class="ticketBadge(ticket.status)">{{ ticketLabel(ticket.status) }}</span>
            </div>

            <!-- Comprador -->
            <div class="mb-3">
              <p class="text-white font-semibold text-sm leading-tight">{{ ticket.buyer?.name }}</p>
              <p class="text-slate-500 text-xs font-mono mt-0.5">{{ ticket.buyer?.phone }}</p>
            </div>

            <!-- Evento + Fase -->
            <div class="space-y-1 mb-3 flex-1">
              <div class="flex items-center gap-1.5 text-xs text-slate-400">
                <svg class="w-3.5 h-3.5 flex-shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">{{ ticket.event?.name }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-xs">
                <svg class="w-3.5 h-3.5 flex-shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                <span class="text-cyan-400/80">{{ ticket.phase?.phaseName }}</span>
              </div>
              <div v-if="authStore.isAdmin && !selectedVendor" class="flex items-center gap-1.5 text-xs text-slate-500">
                <svg class="w-3.5 h-3.5 flex-shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>{{ ticket.seller?.name }}</span>
              </div>
            </div>

            <!-- Fecha de venta o uso -->
            <div class="flex items-center gap-1.5 text-xs mb-3" :class="ticket.status === 'USED' ? 'text-emerald-500' : 'text-slate-600'">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span v-if="ticket.status === 'USED' && ticket.scanLogs?.[0]">
                Usado: {{ formatDate(ticket.scanLogs[0].scannedAt) }}
              </span>
              <span v-else-if="ticket.status === 'USED'">Utilizado</span>
              <span v-else-if="ticket.status === 'AVAILABLE'">Vendido: {{ formatDate(ticket.soldAt) }}</span>
              <span v-else>Cancelado</span>
            </div>

            <!-- Footer: precio + acciones -->
            <div class="flex items-center justify-between pt-3 border-t border-purple-900/20">
              <span class="font-mono font-bold text-cyan-400">${{ Number(ticket.soldPrice).toLocaleString('es-MX') }}</span>
              <div class="flex items-center gap-1">
                <button
                  class="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-900/20 transition"
                  title="Ver QR"
                  @click="selectedTicket = ticket"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5Z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"/>
                  </svg>
                </button>
                <button
                  v-if="authStore.isAdmin"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition"
                  title="Eliminar"
                  @click="cancelTarget = ticket"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="pages > 1" class="flex items-center justify-between">
        <span class="text-xs text-slate-500">Página {{ page }} de {{ pages }}</span>
        <div class="flex gap-2">
          <button class="btn-nebula btn-ghost text-xs px-3 py-1.5" :disabled="page <= 1" @click="page--; fetchTickets()">← Anterior</button>
          <button class="btn-nebula btn-ghost text-xs px-3 py-1.5" :disabled="page >= pages" @click="page++; fetchTickets()">Siguiente →</button>
        </div>
      </div>
    </template>

    <!-- ── MODAL ELIMINAR ─────────────────────────────── -->
    <Transition name="modal">
      <div v-if="cancelTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="cancelTarget = null">
        <div class="card-nebula p-6 w-full max-w-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-white">Eliminar boleto</h3>
              <p class="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <p class="text-slate-400 text-sm mb-5">
            ¿Eliminar el boleto <span class="text-violet-400 font-mono font-semibold">{{ cancelTarget.folio }}</span>
            de <span class="text-white font-semibold">{{ cancelTarget.buyer?.name }}</span>?
          </p>
          <div class="flex gap-3">
            <button class="btn-nebula btn-ghost flex-1" @click="cancelTarget = null">No, mantener</button>
            <button class="btn-nebula btn-danger flex-1" :disabled="cancelling" @click="handleCancel">
              {{ cancelling ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL QR ────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="selectedTicket" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" @click.self="selectedTicket = null">
        <div class="card-nebula p-6 w-full max-w-sm text-center">
          <h3 class="font-display font-semibold text-white mb-1">{{ selectedTicket.folio }}</h3>
          <p class="text-xs text-slate-500 mb-4">{{ selectedTicket.buyer?.name }} · {{ selectedTicket.buyer?.phone }}</p>
          <div v-if="selectedTicket.qrCode" class="mb-4 inline-block p-3 bg-white rounded-xl">
            <img :src="selectedTicket.qrCode" alt="QR" class="w-48 h-48" />
          </div>
          <div class="space-y-1 text-xs text-slate-400 mb-4 text-left bg-purple-900/10 rounded-xl p-3 border border-purple-900/20">
            <p>Evento: <span class="text-slate-200">{{ selectedTicket.event?.name }}</span></p>
            <p>Fase: <span class="text-slate-200">{{ selectedTicket.phase?.phaseName }}</span></p>
            <p>Precio: <span class="text-cyan-400 font-mono font-bold">${{ Number(selectedTicket.soldPrice).toLocaleString('es-MX') }}</span></p>
          </div>
          <button class="btn-nebula btn-ghost w-full" @click="selectedTicket = null">Cerrar</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const authStore = useAuthStore()
const { $api } = useApi()
const { success } = useToast()

interface Vendor {
  id: string; name: string; role: string
  ticketsSold: number; revenue: number; lastSale: string | null
}

interface Ticket {
  id: string; uuid: string; folio: string; status: string
  soldPrice: number; soldAt: string; qrCode?: string
  buyer?: { name: string, phone: string }
  event?: { name: string }
  phase?: { phaseName: string }
  seller?: { name: string }
  scanLogs?: { scannedAt: string }[]
}

const mode = ref<'vendors' | 'tickets'>(authStore.isAdmin ? 'vendors' : 'tickets')
const selectedVendor = ref<Vendor | null>(null)
const vendors = ref<Vendor[]>([])
const loadingVendors = ref(false)
const loading = ref(false)
const tickets = ref<Ticket[]>([])
const total = ref(0)
const page = ref(1)
const pages = ref(1)
const search = ref('')
const selectedTicket = ref<Ticket | null>(null)
const cancelTarget = ref<Ticket | null>(null)
const cancelling = ref(false)

// Stats por fase para el vendedor (calculado del total de SUS boletos sin paginación)
const allMyTickets = ref<Ticket[]>([])

const phaseStats = computed(() => {
  const map = new Map<string, { count: number, revenue: number }>()
  for (const t of allMyTickets.value) {
    const key = t.phase?.phaseName ?? '—'
    const prev = map.get(key) ?? { count: 0, revenue: 0 }
    map.set(key, { count: prev.count + 1, revenue: prev.revenue + Number(t.soldPrice) })
  }
  return [...map.entries()].map(([phase, v]) => ({ phase, ...v }))
    .sort((a, b) => b.count - a.count)
})

onMounted(async () => {
  if (authStore.isAdmin) await fetchVendors()
  else {
    await fetchTickets()
    // Cargar todos los boletos del vendor para calcular stats por fase
    const res = await $api<{ tickets: Ticket[] }>('/tickets?limit=1000')
    allMyTickets.value = res.tickets
  }
})

async function fetchVendors() {
  loadingVendors.value = true
  try { vendors.value = await $api<Vendor[]>('/tickets/vendors') }
  finally { loadingVendors.value = false }
}

async function fetchTickets() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (search.value) params.set('search', search.value)
    if (selectedVendor.value) params.set('sellerId', selectedVendor.value.id)
    params.set('page', String(page.value))
    params.set('limit', '24')
    const res = await $api<{ tickets: Ticket[], total: number, pages: number }>(`/tickets?${params}`)
    tickets.value = res.tickets
    total.value = res.total
    pages.value = res.pages
  }
  finally { loading.value = false }
}

function selectVendor(v: Vendor) {
  selectedVendor.value = v
  mode.value = 'tickets'
  page.value = 1
  search.value = ''
  fetchTickets()
}
function switchToAll() {
  selectedVendor.value = null
  mode.value = 'tickets'
  page.value = 1
  search.value = ''
  fetchTickets()
}
function backToVendors() {
  selectedVendor.value = null
  mode.value = 'vendors'
}

let debounceTimer: ReturnType<typeof setTimeout>
function debounceFetch() {
  page.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchTickets, 350)
}

async function handleCancel() {
  if (!cancelTarget.value) return
  cancelling.value = true
  try {
    await $api(`/tickets/${cancelTarget.value.uuid}/cancel`, { method: 'POST' })
    success('Boleto eliminado', `Folio ${cancelTarget.value.folio} eliminado`)
    cancelTarget.value = null
    await fetchTickets()
  }
  finally { cancelling.value = false }
}

function ticketBadge(s: string) {
  return { AVAILABLE: 'badge-available', USED: 'badge-used', CANCELLED: 'badge-cancelled' }[s] ?? 'badge-draft'
}
function ticketLabel(s: string) {
  return { AVAILABLE: 'Disponible', USED: 'Utilizado', CANCELLED: 'Cancelado' }[s] ?? s
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
