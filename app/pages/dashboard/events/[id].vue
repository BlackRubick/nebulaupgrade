<template>
  <div v-if="loading" class="space-y-4">
    <div class="skeleton h-12 rounded-xl w-64" />
    <div class="skeleton h-64 rounded-xl" />
  </div>

  <div v-else-if="event" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <NuxtLink to="/dashboard/events" class="text-slate-500 hover:text-slate-300 transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </NuxtLink>
          <span class="badge" :class="statusBadge(event.status)">{{ statusLabel(event.status) }}</span>
        </div>
        <h1 class="font-display text-2xl font-bold text-white">{{ event.name }}</h1>
        <p class="text-slate-500 text-sm mt-1">{{ event.location }} · {{ formatDate(event.date) }}</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink v-if="authStore.canSell" :to="`/dashboard/tickets/new?event=${event.id}`" class="btn-nebula btn-primary">
          🎫 Vender boleto
        </NuxtLink>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 gap-4">
      <div class="card-nebula p-4 text-center">
        <div class="text-2xl font-bold font-mono text-cyan-400">{{ event._count?.tickets ?? 0 }}</div>
        <div class="text-xs text-slate-500 mt-1">Boletos vendidos</div>
      </div>
      <div class="card-nebula p-4 text-center">
        <div class="text-2xl font-bold font-mono text-emerald-400">{{ event.phases?.length ?? 0 }}</div>
        <div class="text-xs text-slate-500 mt-1">Fases</div>
      </div>
    </div>

    <!-- Phases -->
    <div class="card-nebula p-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-display font-semibold text-white">Fases de precios</h2>
        <button v-if="authStore.canSell" class="btn-nebula btn-secondary text-xs px-3 py-1.5" @click="showNewPhase = true">
          + Nueva fase
        </button>
      </div>
      <p class="text-xs text-slate-500 mb-5">La fase activa define el precio que ven los vendedores al vender un boleto.</p>

      <div class="space-y-3">
        <div
          v-for="phase in event.phases"
          :key="phase.id"
          class="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
          :class="phase.isActive
            ? 'border border-violet-500/50 bg-violet-900/15 shadow-[0_0_20px_rgba(109,40,217,0.1)]'
            : 'border border-purple-900/20 bg-purple-900/5'"
        >
          <div class="flex items-center gap-3">
            <!-- Indicador activo/inactivo -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              :class="phase.isActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-500'"
            >
              {{ phase.order }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-slate-200">{{ phase.phaseName }}</p>
                <span v-if="phase.isActive" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                  ACTIVA
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ phase.isActive ? 'Precio actual para nuevos boletos' : 'En espera' }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="font-mono font-bold text-lg" :class="phase.isActive ? 'text-cyan-400' : 'text-slate-500'">
                ${{ Number(phase.ticketPrice).toLocaleString('es-MX') }}
              </div>
            </div>
            <!-- Botón activar (solo si no está activa) -->
            <button
              v-if="authStore.canSell && !phase.isActive"
              class="btn-nebula btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
              :disabled="activatingPhase === phase.id"
              @click="handleActivatePhase(phase.id)"
            >
              <svg v-if="activatingPhase === phase.id" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {{ activatingPhase === phase.id ? 'Activando...' : 'Activar' }}
            </button>
            <div v-else-if="phase.isActive" class="w-20" />
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <p class="mt-4 text-xs text-slate-600 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-amber-500/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Los boletos ya vendidos conservan su precio original. Solo los nuevos usan el precio de la fase activa.
      </p>

      <!-- New Phase Modal -->
      <Transition name="modal">
        <div v-if="showNewPhase" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="card-nebula p-6 w-full max-w-md">
            <h3 class="font-display font-semibold text-white mb-5">Nueva fase de precio</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nombre de la fase</label>
                <input v-model="newPhase.phaseName" placeholder="Ej: VIP, Segunda venta..." class="input-nebula" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Precio ($)</label>
                <input v-model.number="newPhase.ticketPrice" type="number" min="1" step="0.01" placeholder="300.00" class="input-nebula" />
              </div>
            </div>
            <div class="flex gap-3 mt-5">
              <button class="btn-nebula btn-ghost flex-1" @click="showNewPhase = false">Cancelar</button>
              <button class="btn-nebula btn-primary flex-1" :disabled="addingPhase" @click="handleAddPhase">
                {{ addingPhase ? 'Guardando...' : 'Crear fase' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'admin'] })

const authStore = useAuthStore()
const { $api } = useApi()
const route = useRoute()
const { success } = useToast()

interface Phase {
  id: string
  phaseName: string
  ticketPrice: number
  isActive: boolean
  order: number
}

interface Event {
  id: string
  name: string

  status: string
  date: string
  location: string

  phases: Phase[]
  _count?: { tickets: number }
}

const loading = ref(true)
const event = ref<Event | null>(null)
const showNewPhase = ref(false)
const addingPhase = ref(false)
const activatingPhase = ref<string | null>(null)
const newPhase = reactive({ phaseName: '', ticketPrice: 0 })

onMounted(async () => {
  try {
    event.value = await $api<Event>(`/events/${route.params.id}`)
  }
  finally {
    loading.value = false
  }
})

async function handleActivatePhase(phaseId: string) {
  activatingPhase.value = phaseId
  try {
    await $api(`/events/${route.params.id}/phases/${phaseId}`, { method: 'PUT' })
    event.value = await $api<Event>(`/events/${route.params.id}`)
    const phase = event.value?.phases.find(p => p.id === phaseId)
    success('Fase activada', `"${phase?.phaseName}" ahora está activa — precio: $${Number(phase?.ticketPrice).toLocaleString('es-MX')}`)
  }
  finally {
    activatingPhase.value = null
  }
}

async function handleAddPhase() {
  if (!newPhase.phaseName || !newPhase.ticketPrice) return
  addingPhase.value = true
  try {
    await $api(`/events/${route.params.id}/phases`, {
      method: 'POST',
      body: JSON.stringify(newPhase),
    })
    event.value = await $api<Event>(`/events/${route.params.id}`)
    success('Fase creada', 'La nueva fase de precio fue creada')
    showNewPhase.value = false
    newPhase.phaseName = ''
    newPhase.ticketPrice = 0
  }
  finally {
    addingPhase.value = false
  }
}

function statusBadge(s: string) {
  switch (s) {
    case 'ACTIVE': return 'badge-active'
    case 'DRAFT': return 'badge-draft'
    case 'FINISHED': return 'badge-finished'
    default: return 'badge-cancelled'
  }
}

function statusLabel(s: string) {
  return { ACTIVE: 'Activo', DRAFT: 'Borrador', FINISHED: 'Finalizado', CANCELLED: 'Cancelado' }[s] ?? s
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
