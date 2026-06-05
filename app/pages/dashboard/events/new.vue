<template>
  <div class="max-w-2xl mx-auto">
    <div class="card-nebula p-8">
      <h2 class="font-display text-2xl font-bold text-white mb-2">Crear Evento</h2>
      <p class="text-slate-500 text-sm mb-8">Completa la información del nuevo evento</p>

      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- Datos básicos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="field-label">Nombre del evento *</label>
            <input v-model="form.name" placeholder="Ej: Festival Nebula 2025" class="input-nebula" required>
          </div>
          <div>
            <label class="field-label">Fecha y hora *</label>
            <input v-model="form.date" type="datetime-local" class="input-nebula" required>
          </div>
          <div>
            <label class="field-label">Lugar *</label>
            <input v-model="form.location" placeholder="Ej: Suchiapa, Chiapas" class="input-nebula" required>
          </div>
        </div>

        <!-- Fases de precios -->
        <div class="pt-4 border-t border-purple-900/20 space-y-4">
          <div>
            <h3 class="font-display font-semibold text-white mb-1">Fases de precios</h3>
            <p class="text-xs text-slate-500">La Fase 1 se activa automáticamente. Las demás quedan en espera.</p>
          </div>

          <div
            v-for="(phase, i) in form.phases"
            :key="i"
            class="phase-row rounded-xl p-4 border"
            :class="i === 0 ? 'border-violet-500/30 bg-violet-900/10' : 'border-purple-900/20 bg-purple-900/5'"
          >
            <div class="flex items-center gap-2 mb-3">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                :class="i === 0 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400'"
              >
                {{ i + 1 }}
              </div>
              <span class="text-sm font-semibold" :class="i === 0 ? 'text-violet-300' : 'text-slate-400'">
                Fase {{ i + 1 }}
                <span v-if="i === 0" class="ml-1 text-xs font-mono text-cyan-400">● Activa al crear</span>
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Nombre</label>
                <input
                  v-model="phase.phaseName"
                  :placeholder="i === 0 ? 'Ej: Preventa' : i === 1 ? 'Ej: General' : 'Ej: VIP'"
                  class="input-nebula"
                  required
                >
              </div>
              <div>
                <label class="field-label">Precio ($)</label>
                <input
                  v-model.number="phase.ticketPrice"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  class="input-nebula"
                  required
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <Transition name="err">
          <div v-if="error" class="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>
        </Transition>

        <div class="flex gap-3 pt-2">
          <NuxtLink to="/dashboard/events" class="btn-nebula btn-ghost flex-1 justify-center py-2.5">
            Cancelar
          </NuxtLink>
          <button type="submit" class="btn-nebula btn-primary flex-1 justify-center py-2.5" :disabled="loading">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ loading ? 'Creando...' : 'Crear Evento' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'admin'] })

const { $api } = useApi()
const router = useRouter()
const { success } = useToast()

const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  date: '',
  location: '',
  status: 'ACTIVE' as const,
  phases: [
    { phaseName: 'Fase 1', ticketPrice: 0 },
    { phaseName: 'Fase 2', ticketPrice: 0 },
    { phaseName: 'Fase 3', ticketPrice: 0 },
  ],
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const ev = await $api<{ id: string }>('/events', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    success('Evento creado', 'El evento fue creado exitosamente')
    await router.push(`/dashboard/events/${ev.id}`)
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al crear el evento'
  }
  finally {
    loading.value = false
  }
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
.err-enter-active, .err-leave-active { transition: all 0.2s ease; }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
