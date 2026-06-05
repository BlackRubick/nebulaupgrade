<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="flex gap-3">
        <input v-model="search" placeholder="Buscar evento..." class="input-nebula w-64">
        <select v-model="statusFilter" class="input-nebula w-40">
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="ACTIVE">Activo</option>
          <option value="FINISHED">Finalizado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>
      <NuxtLink v-if="authStore.canSell" to="/dashboard/events/new" class="btn-nebula btn-primary">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo Evento
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="skeleton h-48 rounded-xl" />
    </div>

    <!-- Empty -->
    <div v-else-if="events.length === 0" class="card-nebula p-16 text-center">
      <svg class="w-12 h-12 mx-auto mb-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <h3 class="font-display text-xl font-semibold text-white mb-2">Sin eventos</h3>
      <p class="text-slate-500 text-sm mb-6">Crea tu primer evento para comenzar</p>
      <NuxtLink v-if="authStore.canSell" to="/dashboard/events/new" class="btn-nebula btn-primary">
        Crear evento
      </NuxtLink>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="event in events"
        :key="event.id"
        class="card-nebula overflow-hidden group"
      >
        <!-- Top: clickable area -->
        <div
          class="h-36 bg-gradient-to-br from-violet-900/50 to-blue-900/30 relative overflow-hidden cursor-pointer"
          @click="navigateTo(`/dashboard/events/${event.id}`)"
        >
          <div class="absolute inset-0 flex items-center justify-center opacity-20">
            <svg class="w-16 h-16 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <div class="absolute top-3 left-3">
            <span class="badge" :class="statusBadge(event.status)">{{ statusLabel(event.status) }}</span>
          </div>
        </div>

        <div class="p-5">
          <h3
            class="font-display font-semibold text-white mb-2 group-hover:text-violet-300 transition line-clamp-1 cursor-pointer"
            @click="navigateTo(`/dashboard/events/${event.id}`)"
          >
            {{ event.name }}
          </h3>

          <div class="space-y-1.5 mb-4">
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ formatDate(event.date) }}
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              <span class="truncate">{{ event.location }}</span>
            </div>
          </div>

          <!-- Stats row -->
          <div class="flex items-center justify-between pt-3 border-t border-purple-900/20 mb-4">
            <div class="text-center">
              <div class="text-lg font-bold font-mono text-cyan-400">{{ event._count?.tickets ?? 0 }}</div>
              <div class="text-xs text-slate-600">Vendidos</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold font-mono text-blue-400">{{ event.phases?.length ?? 0 }}</div>
              <div class="text-xs text-slate-600">Fases</div>
            </div>
          </div>

          <!-- Action buttons -->
          <div v-if="authStore.canSell" class="flex gap-2">
            <button
              class="btn-nebula btn-secondary flex-1 text-xs py-1.5 gap-1.5"
              @click="openEdit(event)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar
            </button>
            <button
              class="btn-nebula btn-danger text-xs px-3 py-1.5"
              @click="openDelete(event)"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── EDIT MODAL ─────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="card-nebula p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-display font-semibold text-white text-lg">Editar Evento</h3>
            <button class="text-slate-500 hover:text-white transition" @click="editModal = false">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="field-label">Nombre del evento</label>
              <input v-model="editForm.name" class="input-nebula" placeholder="Nombre del evento" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Fecha</label>
                <input v-model="editForm.date" type="datetime-local" class="input-nebula" />
              </div>
              </div>
            <div>
              <label class="field-label">Ubicación</label>
              <input v-model="editForm.location" class="input-nebula" placeholder="Ubicación" />
            </div>
            <div>
              <label class="field-label">Estado</label>
              <select v-model="editForm.status" class="input-nebula">
                <option value="DRAFT">Borrador</option>
                <option value="ACTIVE">Activo</option>
                <option value="FINISHED">Finalizado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button class="btn-nebula btn-ghost flex-1" @click="editModal = false">Cancelar</button>
            <button class="btn-nebula btn-primary flex-1" :disabled="saving" @click="handleEdit">
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── DELETE CONFIRM MODAL ───────────────────────── -->
    <Transition name="modal">
      <div v-if="deleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="card-nebula p-6 w-full max-w-sm" @click.stop>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-display font-semibold text-white">Eliminar evento</h3>
              <p class="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <p class="text-slate-400 text-sm mb-5">
            ¿Seguro que quieres eliminar <span class="text-white font-semibold">{{ targetEvent?.name }}</span>?
            Se eliminarán todos sus datos.
          </p>

          <div class="flex gap-3">
            <button class="btn-nebula btn-ghost flex-1" @click="deleteModal = false">Cancelar</button>
            <button class="btn-nebula btn-danger flex-1" :disabled="deleting" @click="handleDelete">
              {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'admin'] })

const authStore = useAuthStore()
const { $api } = useApi()
const { success, error: toastError } = useToast()

interface Event {
  id: string
  name: string
  status: string
  date: string
  location: string
  phases: unknown[]
  _count?: { tickets: number }
}

const loading = ref(true)
const allEvents = ref<Event[]>([])
const search = ref('')
const statusFilter = ref('')

// Edit
const editModal = ref(false)
const saving = ref(false)
const targetEvent = ref<Event | null>(null)
const editForm = reactive({
  name: '',
  date: '',
  location: '',
  status: '',
})

// Delete
const deleteModal = ref(false)
const deleting = ref(false)

onMounted(async () => {
  await fetchEvents()
})

async function fetchEvents() {
  loading.value = true
  try {
    allEvents.value = await $api<Event[]>('/events')
  }
  finally {
    loading.value = false
  }
}

const events = computed(() =>
  allEvents.value.filter(e => {
    const matchSearch = !search.value || e.name.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || e.status === statusFilter.value
    return matchSearch && matchStatus
  }),
)

// ── Edit ──────────────────────────────────────────────
function openEdit(ev: Event) {
  targetEvent.value = ev
  editForm.name = ev.name
  editForm.date = ev.date ? new Date(ev.date).toISOString().slice(0, 16) : ''
  editForm.location = ev.location
  editForm.status = ev.status
  editModal.value = true
}

async function handleEdit() {
  if (!targetEvent.value) return
  saving.value = true
  try {
    await $api(`/events/${targetEvent.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...editForm }),
    })
    success('Evento actualizado', `"${editForm.name}" fue actualizado`)
    editModal.value = false
    await fetchEvents()
  }
  catch {
    toastError('Error', 'No se pudo actualizar el evento')
  }
  finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────
function openDelete(ev: Event) {
  targetEvent.value = ev
  deleteModal.value = true
}

async function handleDelete() {
  if (!targetEvent.value) return
  deleting.value = true
  try {
    await $api(`/events/${targetEvent.value.id}`, { method: 'DELETE' })
    success('Evento eliminado', `"${targetEvent.value.name}" fue eliminado`)
    deleteModal.value = false
    await fetchEvents()
  }
  catch {
    toastError('Error', 'No se pudo eliminar el evento')
  }
  finally {
    deleting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────
function statusBadge(s: string) {
  return { ACTIVE: 'badge-active', DRAFT: 'badge-draft', FINISHED: 'badge-finished', CANCELLED: 'badge-cancelled' }[s] ?? 'badge-draft'
}
function statusLabel(s: string) {
  return { ACTIVE: 'Activo', DRAFT: 'Borrador', FINISHED: 'Finalizado', CANCELLED: 'Cancelado' }[s] ?? s
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.4rem;
}
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
