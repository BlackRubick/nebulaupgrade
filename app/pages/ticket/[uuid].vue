<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4" style="background:#0d0d0d;">

    <!-- Loading -->
    <div v-if="pending" class="text-center">
      <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p class="text-slate-500 text-sm">Cargando boleto...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center max-w-xs">
      <div class="text-5xl mb-4">❌</div>
      <h2 class="text-xl font-bold text-red-400 mb-2">Boleto no encontrado</h2>
      <p class="text-slate-500 text-sm">El código QR no corresponde a ningún boleto válido.</p>
    </div>

    <!-- Boleto con template -->
    <div v-else-if="ticket" class="w-full max-w-xs mx-auto space-y-4">

      <!-- Template + QR -->
      <div ref="ticketRef" class="relative w-full shadow-2xl shadow-black/60 rounded-2xl overflow-hidden">
        <img
          src="/images/2.jpg"
          alt="Boleto La Perrera"
          class="w-full block"
          draggable="false"
          crossorigin="anonymous"
        />

        <!-- QR en el cuadrado negro — ajustado más abajo -->
        <div
          class="absolute flex items-center justify-center"
          style="top:31%; left:10.5%; width:79%; height:37%;"
        >
          <img
            v-if="ticket.qrCode"
            :src="ticket.qrCode"
            alt="QR"
            class="w-full h-full object-contain"
            :class="ticket.status !== 'AVAILABLE' ? 'opacity-25 grayscale' : ''"
            draggable="false"
          />
        </div>

        <!-- Banner USADO -->
        <div
          v-if="ticket.status === 'USED'"
          class="absolute flex items-center justify-center"
          style="top:31%; left:10.5%; width:79%; height:37%;"
        >
          <div class="bg-black/70 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p class="text-2xl font-black text-violet-400 tracking-widest">UTILIZADO</p>
          </div>
        </div>

        <!-- Banner CANCELADO -->
        <div
          v-if="ticket.status === 'CANCELLED'"
          class="absolute flex items-center justify-center"
          style="top:31%; left:10.5%; width:79%; height:37%;"
        >
          <div class="bg-black/70 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p class="text-2xl font-black text-red-400 tracking-widest">CANCELADO</p>
          </div>
        </div>
      </div>

      <!-- Info del titular -->
      <div class="rounded-xl border border-white/8 px-4 py-3 space-y-3" style="background:rgba(255,255,255,0.04);">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-white font-bold truncate">{{ ticket.buyer?.name }}</p>
            <p class="text-slate-500 text-xs mt-0.5">Titular del boleto</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-mono text-violet-400 font-bold text-sm">{{ ticket.folio }}</p>
            <p class="text-slate-500 text-xs mt-0.5">Folio</p>
          </div>
        </div>

        <div class="border-t border-white/6" />

        <div class="flex items-center justify-between text-xs">
          <div>
            <p class="text-slate-500 mb-0.5">Fase</p>
            <span class="text-cyan-400 font-mono">{{ ticket.phase?.phaseName }}</span>
          </div>
          <div class="text-right">
            <p class="text-slate-500 mb-0.5">Estado</p>
            <span
              class="font-bold"
              :class="{
                'text-emerald-400': ticket.status === 'AVAILABLE',
                'text-violet-400': ticket.status === 'USED',
                'text-red-400': ticket.status === 'CANCELLED',
              }"
            >
              {{ statusLabel(ticket.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Botón descargar -->
      <button
        class="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
        :class="downloading ? 'opacity-60 cursor-not-allowed' : ''"
        style="background:rgba(109,40,217,0.15); border:1px solid rgba(109,40,217,0.3); color:#a78bfa;"
        :disabled="downloading"
        @click="downloadTicket"
      >
        <svg v-if="downloading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        {{ downloading ? 'Generando...' : 'Descargar boleto' }}
      </button>

      <p class="text-center text-xs text-slate-700 font-mono pb-2">
        Presenta este boleto en la entrada del evento
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { data: ticket, pending, error } = await useFetch(`/api/ticket/${route.params.uuid}`)

const downloading = ref(false)

// Posición del QR sobre el cuadrado negro (en fracción del total de la imagen)
const QR_TOP    = 0.31
const QR_LEFT   = 0.105
const QR_WIDTH  = 0.79
const QR_HEIGHT = 0.37

async function downloadTicket() {
  if (!ticket.value?.qrCode) return
  downloading.value = true
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // Cargar template
    const template = await loadImage('/images/2.jpg')
    canvas.width  = template.naturalWidth
    canvas.height = template.naturalHeight
    ctx.drawImage(template, 0, 0)

    // Área del cuadrado negro en píxeles
    const x = canvas.width  * QR_LEFT
    const y = canvas.height * QR_TOP
    const w = canvas.width  * QR_WIDTH
    const h = canvas.height * QR_HEIGHT

    // Fondo blanco para el QR
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x, y, w, h)

    // Dibujar QR centrado con padding
    const qrImg = await loadImage(ticket.value.qrCode)
    const padding = w * 0.08
    ctx.drawImage(qrImg, x + padding, y + padding, w - padding * 2, h - padding * 2)

    // Descargar
    const a = document.createElement('a')
    a.download = `boleto-${ticket.value.folio}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  finally {
    downloading.value = false
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function statusLabel(s: string) {
  return { AVAILABLE: 'Válido', USED: 'Utilizado', CANCELLED: 'Cancelado' }[s] ?? s
}
</script>
