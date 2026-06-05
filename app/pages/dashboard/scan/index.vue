<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-4">
    <div class="w-full max-w-md space-y-5">

      <!-- Scanner Card -->
      <div class="card-nebula overflow-hidden">

        <!-- Header -->
        <div class="p-6 text-center border-b border-purple-900/20">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mx-auto mb-4 glow-cyan">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5Z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"/>
            </svg>
          </div>
          <h2 class="font-display text-xl font-bold text-white">Control de Acceso</h2>
          <p class="text-slate-500 text-sm mt-1">Escanea el QR del boleto con la cámara</p>
        </div>

        <!-- Vista de cámara -->
        <div v-show="cameraActive && !scanResult" class="relative bg-black">
          <div id="qr-reader" class="w-full" />
          <button
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition z-10"
            @click="stopCamera"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Botón para abrir cámara -->
        <div v-if="!cameraActive && !scanResult" class="p-6">
          <button
            class="btn-nebula btn-primary w-full py-4 text-base gap-3"
            :disabled="starting"
            @click="startCamera"
          >
            <svg v-if="starting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ starting ? 'Iniciando cámara...' : 'Abrir cámara' }}
          </button>

          <p v-if="cameraError" class="text-red-400 text-xs text-center mt-3">{{ cameraError }}</p>
        </div>

        <!-- Validando -->
        <div v-if="scanning" class="p-8 text-center">
          <svg class="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p class="text-slate-400 text-sm">Validando boleto...</p>
        </div>

        <!-- Resultado -->
        <div v-if="scanResult && !scanning">

          <!-- ✅ ACCESO AUTORIZADO -->
          <div v-if="scanResult.success" class="bg-emerald-500/10 border-b border-emerald-500/20 p-6 text-center">
            <div class="text-6xl mb-3">✅</div>
            <p class="font-display text-2xl font-black text-emerald-400 tracking-wider">ACCESO AUTORIZADO</p>
            <p class="text-emerald-600 text-sm mt-1">Boleto marcado como utilizado</p>
          </div>

          <!-- ⚠️ YA UTILIZADO -->
          <div v-else-if="scanResult.reason === 'ALREADY_USED'" class="bg-amber-500/10 border-b border-amber-500/20 p-6 text-center">
            <div class="text-6xl mb-3">⚠️</div>
            <p class="font-display text-2xl font-black text-amber-400 tracking-wider">YA FUE UTILIZADO</p>
            <p class="text-amber-600 text-sm mt-1">Este boleto ya fue escaneado anteriormente</p>
          </div>

          <!-- ❌ NO VÁLIDO -->
          <div v-else class="bg-red-500/10 border-b border-red-500/20 p-6 text-center">
            <div class="text-6xl mb-3">❌</div>
            <p class="font-display text-2xl font-black text-red-400 tracking-wider">BOLETO NO VÁLIDO</p>
            <p class="text-red-600 text-sm mt-1">{{ scanResult.message }}</p>
          </div>

          <!-- Datos del comprador (siempre que haya ticket) -->
          <div v-if="scanResult.ticket" class="p-5 space-y-3">
            <!-- Nombre del comprador destacado -->
            <div class="flex items-center gap-3 p-3 rounded-xl bg-purple-900/20 border border-purple-900/30">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {{ scanResult.ticket.buyer?.name?.charAt(0)?.toUpperCase() ?? '?' }}
              </div>
              <div class="min-w-0">
                <p class="text-white font-semibold">{{ scanResult.ticket.buyer?.name }}</p>
                <p class="text-slate-400 text-sm font-mono">{{ scanResult.ticket.buyer?.phone }}</p>
              </div>
              <span class="badge text-xs ml-auto flex-shrink-0" :class="scanResult.success ? 'badge-used' : scanResult.reason === 'ALREADY_USED' ? 'badge-used' : 'badge-cancelled'">
                {{ scanResult.success ? 'Utilizado' : scanResult.reason === 'ALREADY_USED' ? 'Ya usado' : 'Inválido' }}
              </span>
            </div>

            <!-- Detalles del boleto -->
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-slate-900/40 rounded-lg p-3">
                <p class="text-xs text-slate-600 uppercase tracking-wider mb-1">Folio</p>
                <p class="font-mono text-violet-400 font-bold text-xs">{{ scanResult.ticket.folio }}</p>
              </div>
              <div class="bg-slate-900/40 rounded-lg p-3">
                <p class="text-xs text-slate-600 uppercase tracking-wider mb-1">Fase</p>
                <p class="text-cyan-400 text-xs">{{ scanResult.ticket.phase?.phaseName }}</p>
              </div>
              <div class="bg-slate-900/40 rounded-lg p-3 col-span-2">
                <p class="text-xs text-slate-600 uppercase tracking-wider mb-1">Evento</p>
                <p class="text-slate-300 text-xs">{{ scanResult.ticket.event?.name }}</p>
              </div>
            </div>
          </div>

          <div class="px-5 pb-5">
            <button class="btn-nebula btn-primary w-full" @click="scanAnother">
              Escanear otro
            </button>
          </div>
        </div>
      </div>

      <!-- Historial de sesión -->
      <div v-if="history.length > 0" class="card-nebula p-5">
        <h3 class="font-display font-semibold text-white mb-4 text-sm">Historial de esta sesión</h3>
        <div class="space-y-2">
          <div
            v-for="(entry, i) in history"
            :key="i"
            class="flex items-center gap-3 p-2 rounded-lg text-xs"
            :class="entry.success ? 'bg-emerald-500/5' : 'bg-red-500/5'"
          >
            <span>{{ entry.success ? '✅' : '❌' }}</span>
            <span class="font-mono text-violet-400">{{ entry.folio }}</span>
            <span class="text-slate-500 flex-1 truncate">{{ entry.name }}</span>
            <span class="text-slate-600 flex-shrink-0">{{ entry.time }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { $api } = useApi()

interface ScanResult {
  success: boolean
  reason: string
  message: string
  ticket?: {
    folio: string
    status: string
    buyer?: { name: string, phone: string }
    event?: { name: string }
    phase?: { phaseName: string }
  }
}

const cameraActive = ref(false)
const starting = ref(false)
const scanning = ref(false)
const cameraError = ref('')
const scanResult = ref<ScanResult | null>(null)
const history = ref<Array<{ success: boolean, folio: string, name: string, time: string }>>([])

let scanner: import('html5-qrcode').Html5Qrcode | null = null

function extractUuid(raw: string): string {
  const trimmed = raw.trim()
  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1]
  }
  catch {
    const match = trimmed.match(/\/ticket\/([^/?#]+)/)
    return match ? match[1] : trimmed
  }
}

async function startCamera() {
  cameraError.value = ''
  starting.value = true
  cameraActive.value = true      // mostrar el div ANTES de iniciar
  await nextTick()               // esperar a que el DOM pinte el #qr-reader
  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner = new Html5Qrcode('qr-reader')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      onQrDetected,
      () => { /* errores de frame ignorados */ },
    )
  }
  catch (e: unknown) {
    cameraActive.value = false
    const msg = e instanceof Error ? e.message : String(e)
    cameraError.value = msg.includes('ermission')
      ? 'Sin permiso para acceder a la cámara'
      : 'No se pudo iniciar la cámara'
  }
  finally {
    starting.value = false
  }
}

async function stopCamera() {
  if (scanner) {
    await scanner.stop().catch(() => {})
    scanner = null
  }
  cameraActive.value = false
}

async function onQrDetected(text: string) {
  await stopCamera()
  const uuid = extractUuid(text)
  scanning.value = true
  try {
    const result = await $api<ScanResult>(`/scan/${uuid}`, { method: 'POST' })
    scanResult.value = result
    history.value.unshift({
      success: result.success,
      folio: result.ticket?.folio ?? uuid.slice(0, 8) + '...',
      name: result.ticket?.buyer?.name ?? 'Desconocido',
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    })
    if (history.value.length > 20) history.value = history.value.slice(0, 20)
  }
  finally {
    scanning.value = false
  }
}

async function scanAnother() {
  scanResult.value = null
  await startCamera()
}

onUnmounted(() => stopCamera())
</script>

<style>
/* Ocultar botones y textos propios de html5-qrcode que no necesitamos */
#qr-reader__dashboard_section_csr button,
#qr-reader__dashboard_section_fsr,
#qr-reader__status_span,
#qr-reader__header_message,
#qr-reader__filescan_input {
  display: none !important;
}
#qr-reader {
  border: none !important;
}
#qr-reader video {
  border-radius: 0 !important;
}
</style>
