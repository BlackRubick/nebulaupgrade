<template>
  <div class="space-y-8">
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="skeleton h-24 rounded-xl" />
      </div>
    </div>

    <template v-else>
      <!-- Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card-nebula p-5 text-center">
          <div class="text-3xl font-bold font-mono text-white">{{ data.overview.activeEvents }}</div>
          <div class="text-xs text-slate-500 mt-1">Eventos activos</div>
        </div>
        <div class="card-nebula p-5 text-center">
          <div class="text-3xl font-bold font-mono text-cyan-400">{{ data.overview.ticketsSold }}</div>
          <div class="text-xs text-slate-500 mt-1">Boletos vendidos</div>
        </div>
        <div class="card-nebula p-5 text-center">
          <div class="text-3xl font-bold font-mono text-violet-400">{{ data.overview.ticketsUsed }}</div>
          <div class="text-xs text-slate-500 mt-1">Utilizados</div>
        </div>
        <div class="card-nebula p-5 text-center col-span-2 md:col-span-1 border border-emerald-500/20">
          <div class="text-xs text-slate-500 mb-1">Ingresos totales</div>
          <div class="text-2xl font-bold font-mono text-emerald-400">${{ data.overview.totalRevenue.toLocaleString('es-MX') }}</div>
        </div>
      </div>

      <!-- Revenue by Event -->
      <div class="card-nebula p-6">
        <h2 class="font-display font-semibold text-white mb-5">Ingresos por evento</h2>
        <div class="overflow-x-auto">
          <table class="table-nebula">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Estado</th>
                <th>Boletos vendidos</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ev in data.events" :key="ev.id">
                <td class="font-medium text-slate-200">{{ ev.name }}</td>
                <td><span class="badge text-xs" :class="statusBadge(ev.status)">{{ statusLabel(ev.status) }}</span></td>
                <td class="font-mono text-slate-300">{{ ev.ticketsSold }}</td>
                <td class="font-mono text-cyan-400 font-bold">${{ ev.revenue.toLocaleString('es-MX') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Phases Breakdown -->
      <div class="card-nebula p-4 md:p-6">
        <h2 class="font-display font-semibold text-white mb-5">Desglose por fases</h2>
        <div class="overflow-x-auto">
          <table class="table-nebula">
            <thead>
              <tr>
                <th class="hidden sm:table-cell">Evento</th>
                <th>Fase</th>
                <th>Precio</th>
                <th>Vendidos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="phase in data.phases" :key="phase.id">
                <td class="hidden sm:table-cell text-slate-400 text-xs">{{ phase.eventName }}</td>
                <td class="font-medium text-slate-200">{{ phase.phaseName }}</td>
                <td class="font-mono text-violet-400">${{ phase.price.toLocaleString('es-MX') }}</td>
                <td class="font-mono text-slate-300">{{ phase.sold }}</td>
                <td class="font-mono text-cyan-400 font-bold">${{ phase.revenue.toLocaleString('es-MX') }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="hidden sm:table-cell font-bold text-slate-300 text-right">Total general</td>
                <td colspan="2" class="sm:hidden font-bold text-slate-300 text-right">Total</td>
                <td class="hidden sm:table-cell font-mono font-bold text-emerald-400 text-lg">
                  ${{ data.phases.reduce((s, p) => s + p.revenue, 0).toLocaleString('es-MX') }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Vendor Performance -->
      <div class="card-nebula p-6">
        <h2 class="font-display font-semibold text-white mb-5">Vendedores — desglose por fase</h2>
        <div class="space-y-2">
          <div v-for="(vendor, i) in data.vendors" :key="vendor.id" class="rounded-xl border border-purple-900/20 overflow-hidden">
            <!-- Fila principal (clickable) -->
            <button
              class="w-full flex items-center gap-4 px-4 py-3 hover:bg-purple-900/10 transition text-left"
              @click="toggleVendor(vendor.id)"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-slate-200">{{ vendor.name }}</p>
                <p class="text-xs text-slate-500">{{ vendor.ticketsSold }} boleto{{ vendor.ticketsSold !== 1 ? 's' : '' }} vendido{{ vendor.ticketsSold !== 1 ? 's' : '' }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-xs text-slate-500 mb-0.5">Debe entregar</p>
                <p class="font-mono font-bold text-emerald-400 text-base">${{ vendor.revenue.toLocaleString('es-MX') }}</p>
              </div>
              <svg
                class="w-4 h-4 text-slate-500 transition-transform flex-shrink-0"
                :class="expandedVendors.has(vendor.id) ? 'rotate-90' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Desglose por fase (expandible) -->
            <div v-if="expandedVendors.has(vendor.id)" class="border-t border-purple-900/20 bg-purple-950/20">
              <table class="table-nebula">
                <thead>
                  <tr>
                    <th>Fase</th>
                    <th class="text-center">Boletos</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phase in vendor.phases" :key="phase.phaseName">
                    <td class="text-slate-300">{{ phase.phaseName }}</td>
                    <td class="text-center font-mono text-slate-400">{{ phase.count }}</td>
                    <td class="text-right font-mono text-cyan-400 font-bold">${{ phase.revenue.toLocaleString('es-MX') }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td class="font-bold text-slate-300">Total</td>
                    <td class="text-center font-mono font-bold text-white">{{ vendor.ticketsSold }}</td>
                    <td class="text-right font-mono font-bold text-emerald-400">${{ vendor.revenue.toLocaleString('es-MX') }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div v-if="data.vendors.length === 0" class="text-center py-6 text-slate-500 text-sm">
            Sin vendedores con ventas
          </div>
        </div>

        <!-- Total a recibir -->
        <div v-if="data.vendors.length > 0" class="flex items-center justify-between mt-4 p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
          <div>
            <p class="font-semibold text-slate-300">Total a recibir de vendedores</p>
            <p class="text-xs text-slate-500">{{ data.vendors.length }} vendedor{{ data.vendors.length !== 1 ? 'es' : '' }}</p>
          </div>
          <p class="font-mono font-bold text-emerald-400 text-2xl">
            ${{ data.vendors.reduce((s, v) => s + v.revenue, 0).toLocaleString('es-MX') }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'admin'] })

const { $api } = useApi()

interface VendorPhase {
  phaseName: string
  count: number
  revenue: number
}

interface FinancialData {
  overview: { activeEvents: number, finishedEvents: number, totalRevenue: number, ticketsSold: number, ticketsUsed: number, ticketsPending: number, ticketsCancelled: number }
  events: Array<{ id: string, name: string, status: string, ticketsSold: number, revenue: number }>
  phases: Array<{ id: string, eventName: string, phaseName: string, price: number, sold: number, revenue: number }>
  vendors: Array<{ id: string, name: string, ticketsSold: number, revenue: number, lastSale?: string, phases: VendorPhase[] }>
}

const loading = ref(true)
const data = ref<FinancialData>({
  overview: { activeEvents: 0, finishedEvents: 0, totalRevenue: 0, ticketsSold: 0, ticketsUsed: 0, ticketsPending: 0, ticketsCancelled: 0 },
  events: [],
  phases: [],
  vendors: [],
})

const expandedVendors = ref(new Set<string>())

function toggleVendor(id: string) {
  if (expandedVendors.value.has(id)) {
    expandedVendors.value.delete(id)
  } else {
    expandedVendors.value.add(id)
  }
  expandedVendors.value = new Set(expandedVendors.value)
}

onMounted(async () => {
  try {
    data.value = await $api<FinancialData>('/financial/summary')
  }
  finally {
    loading.value = false
  }
})

function statusBadge(s: string) {
  return s === 'ACTIVE' ? 'badge-active' : 'badge-finished'
}

function statusLabel(s: string) {
  return { ACTIVE: 'Activo', FINISHED: 'Finalizado', CANCELLED: 'Cancelado', DRAFT: 'Borrador' }[s] ?? s
}
</script>
