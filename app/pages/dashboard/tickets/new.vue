<template>
  <div class="flex items-start justify-center py-4 md:py-6 min-h-[calc(100vh-8rem)]">
  <div class="w-full max-w-lg space-y-6">

    <!-- Aviso de vendedor bloqueado -->
    <div v-if="!authStore.canSell && !authStore.isAdmin" class="card-nebula p-8 text-center">
      <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
        </svg>
      </div>
      <h2 class="font-display text-xl font-bold text-white mb-2">Ventas desactivadas</h2>
      <p class="text-slate-400 text-sm leading-relaxed">
        Tu cuenta no tiene permiso para vender boletos en este momento.<br>
        Contacta al administrador para más información.
      </p>
    </div>

    <!-- Resultado exitoso -->
    <Transition name="result">
      <div v-if="result" class="card-nebula p-8 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="font-display text-2xl font-bold text-white mb-1">¡Venta registrada!</h2>
        <p class="text-slate-400 text-sm mb-6">Boleto generado correctamente</p>

        <div v-for="ticket in result.tickets" :key="ticket.id" class="glass rounded-xl p-4 mb-3 text-left space-y-3">
          <!-- Info del boleto -->
          <div class="flex items-center gap-4">
            <div v-if="ticket.qrCode" class="flex-shrink-0 bg-white rounded-lg p-1.5">
              <img :src="ticket.qrCode" alt="QR" class="w-20 h-20" />
            </div>
            <div class="min-w-0">
              <p class="font-mono text-violet-400 font-bold">{{ ticket.folio }}</p>
              <p class="text-white font-medium">{{ ticket.buyer?.name }}</p>
              <p class="text-xs text-slate-500 font-mono">{{ ticket.buyer?.phone }}</p>
              <p class="text-cyan-400 font-mono font-bold mt-1">${{ Number(ticket.soldPrice).toLocaleString('es-MX') }}</p>
            </div>
          </div>

          <!-- Botón WhatsApp -->
          <a
            :href="whatsappUrl(ticket)"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style="background:#25D366; color:#fff;"
            @mouseenter="($event.currentTarget as HTMLElement).style.background='#1ebe5d'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background='#25D366'"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar por WhatsApp
          </a>
        </div>

        <div class="flex gap-3 mt-4">
          <button class="btn-nebula btn-secondary flex-1" @click="resetForm">
            Otro boleto
          </button>
          <NuxtLink to="/dashboard/tickets" class="btn-nebula btn-ghost flex-1">
            Ver boletos
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Formulario -->
    <div v-if="!result && (authStore.canSell || authStore.isAdmin)" class="card-nebula p-8">
      <h2 class="font-display text-2xl font-bold text-white mb-1">Vender Boleto</h2>
      <p class="text-slate-500 text-sm mb-8">Selecciona el evento e ingresa los datos del comprador</p>

      <form @submit.prevent="handleSubmit" class="space-y-5">

        <!-- Selector de evento -->
        <div>
          <label class="field-label">Evento *</label>
          <select v-model="form.eventId" class="input-nebula" required @change="onEventChange">
            <option value="">Selecciona un evento...</option>
            <option v-for="ev in activeEvents" :key="ev.id" :value="ev.id">
              {{ ev.name }} — {{ formatDate(ev.date) }}
            </option>
          </select>
        </div>

        <!-- Info del evento seleccionado -->
        <Transition name="slide">
          <div v-if="selectedEvent" class="rounded-xl border border-violet-500/25 bg-violet-900/10 overflow-hidden">
            <!-- Datos del evento -->
            <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-4">
              <div>
                <p class="text-white font-semibold">{{ selectedEvent.name }}</p>
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {{ formatDate(selectedEvent.date) }}
                </div>
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {{ selectedEvent.location }}
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-xs text-slate-500 mb-0.5">{{ activePhase?.phaseName ?? '—' }}</p>
                <p class="text-2xl font-bold font-mono text-cyan-400">
                  ${{ activePhase ? Number(activePhase.ticketPrice).toLocaleString('es-MX') : '—' }}
                </p>
              </div>
            </div>
            <!-- Sin fase activa -->
            <div v-if="!activePhase" class="px-4 pb-3">
              <p class="text-xs text-amber-400 bg-amber-900/15 border border-amber-500/20 rounded-lg px-3 py-2">
                Este evento no tiene una fase activa. Activa una fase antes de vender.
              </p>
            </div>
          </div>
        </Transition>

        <!-- Nombre -->
        <div>
          <label class="field-label">Nombre del comprador *</label>
          <input
            v-model="form.buyerName"
            placeholder="Nombre completo"
            class="input-nebula"
            required
          >
        </div>

        <!-- Teléfono -->
        <div>
          <label class="field-label">Teléfono *</label>
          <input
            v-model="form.buyerPhone"
            placeholder="10 dígitos"
            class="input-nebula"
            inputmode="numeric"
            required
          >
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

        <div class="flex gap-3 pt-1">
          <NuxtLink to="/dashboard/tickets" class="btn-nebula btn-ghost flex-1 justify-center py-3">
            Cancelar
          </NuxtLink>
          <button
            type="submit"
            class="btn-nebula btn-primary flex-1 justify-center py-3"
            :disabled="loading || !activePhase"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            {{ loading ? 'Procesando...' : 'Vender boleto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { $api } = useApi()
const route = useRoute()
const { success } = useToast()

interface Phase {
  id: string
  phaseName: string
  ticketPrice: number
  isActive: boolean
}

interface Event {
  id: string
  name: string
  date: string
  location: string
  status: string
  capacity: number
  phases: Phase[]
  _count?: { tickets: number }
}

interface SaleResult {
  tickets: Array<{ id: string, uuid: string, folio: string, soldPrice: number, qrCode?: string, buyer?: { name: string, phone: string }, event?: { name: string }, phase?: { phaseName: string } }>
}

const loading = ref(false)
const error = ref('')
const activeEvents = ref<Event[]>([])
const selectedEvent = ref<Event | null>(null)
const result = ref<SaleResult | null>(null)

const form = reactive({
  eventId: (route.query.event as string) || '',
  buyerName: '',
  buyerPhone: '',
})

onMounted(async () => {
  const events = await $api<Event[]>('/events?status=ACTIVE')
  activeEvents.value = events
  if (form.eventId) {
    selectedEvent.value = events.find(e => e.id === form.eventId) ?? null
  }
})

const activePhase = computed(() => selectedEvent.value?.phases.find(p => p.isActive))

function onEventChange() {
  selectedEvent.value = activeEvents.value.find(e => e.id === form.eventId) ?? null
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const data = await $api<SaleResult>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        eventId: form.eventId,
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        quantity: 1,
      }),
    })
    result.value = data
    success('Venta registrada', 'Boleto generado correctamente')
  }
  catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al procesar la venta'
  }
  finally {
    loading.value = false
  }
}

function resetForm() {
  result.value = null
  form.buyerName = ''
  form.buyerPhone = ''
}

function whatsappUrl(ticket: SaleResult['tickets'][0]) {
  const appUrl = window.location.origin

  // Normalizar número: quitar no-dígitos y agregar código de México si faltan
  const digits = (ticket.buyer?.phone ?? '').replace(/\D/g, '')
  const phone = digits.startsWith('52') ? digits : `52${digits}`

  const link = `${appUrl}/ticket/${ticket.uuid}`
  const msg = [
    `¡Hola ${ticket.buyer?.name}!`,
    ``,
    `Aquí está tu boleto para *${ticket.event?.name ?? 'el evento'}*.`,
    ``,
    `*Folio:* ${ticket.folio}`,
    `*Fase:* ${ticket.phase?.phaseName ?? ''}`,
    ``,
    `Accede a tu boleto aquí:`,
    link,
    ``,
    `¡Nos vemos pronto!`,
  ].join('\n')

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
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
.err-enter-active, .err-leave-active { transition: all 0.2s ease; }
.err-enter-from, .err-leave-to { opacity: 0; transform: translateY(-4px); }
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
.result-enter-active, .result-leave-active { transition: all 0.3s ease; }
.result-enter-from, .result-leave-to { opacity: 0; transform: scale(0.95); }
</style>
